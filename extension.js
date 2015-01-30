/**
 * @todo - usar GnomeSession para nao fazer requisicao quando sessao estiver parada.
 */

/**
 * Configuracoes
 */
let config = {

    /**
     * Caminho do redmine
     */
    uri : 'http://redmine.dbseller.com.br:8888',

    /**
     * Parametros extras da url
     */
    uriQueryString : 'query_id=18',

    /**
     * Intervalo em segundos para atualizar lista de tarefas
     */
    updateTime : 60,

    /**
     * Define o programa que ira ser executado para abrir o link da tarefa
     */
    opener : 'firefox',

    /**
     * Contadores das tarefas
     */
    listeners : [

        {
            title : 'Tarefas novas',
            status : {name : 'Nova'},
            issueTitleMask : '#id | GUT: #gut | #tracker | #subject'
        },

        {
            title : 'Tarefas aceitas',
            status : {name : 'Aceita'},
            issueTitleMask : '#id | GUT: #gut | #tracker | #subject'
        }
    ]

}; 

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;

const Redmine = new Lang.Class({

    Name : 'Redmine',
    Extends : PanelMenu.Button,

    _init : function(config) {

        this.parent(St.Align.START);
        this.config = config;
        this.listeners = config.listeners;
        this.boxLayout = new St.BoxLayout();
        this.labels  = [];

        this.GUT = [];
        this.menuStyle = [];
        this.labelStyle = [];

        this.config.uri = this.config.uri.rtrim('/');
        this.uriIssues = this.config.uri + '/issues.json';

        this.issues = {};

        if ('uriQueryString' in this.config) {
            this.uriIssues += '?' + this.config.uriQueryString;
        }

        this.createLabels();
        this.update();

        this.actor.add_actor(this.boxLayout);
        this.connect('destroy', Lang.bind(this, this.onDestroy));
    },

    processIssues : function () {

        this.loadIssues();

        let issues = this.issues;

        if (!('issues' in issues)) {
            return;
        }

        for (let currentIssue = 0; currentIssue < issues.issues.length; currentIssue++) {

            let issue = issues.issues[currentIssue];

            for (let currentListener = 0; currentListener < this.listeners.length; currentListener++) {

                let listener = this.listeners[currentListener];

                if (this.seek(issue, listener)) {

                    this.processCustomFields(issue, listener);
                    this.listeners[currentListener].count++;
                    this.listeners[currentListener].issues.push(issue);
                }
            }
        }
    },

    seek : function(issue, listener) {

        if ('status' in issue && 'status' in listener) {

            if ('id' in listener.status && listener.status.id == issue.status.id) {
                return true;
            }

            if ('name' in listener.status) {

                if (issue.status.name.toLowerCase().indexOf(listener.status.name.toLowerCase()) !== -1) {
                    return true;
                }
            }
        }

        return false;
    },

    processCustomFields : function(issue, listener) {

        if (!('custom_fields' in issue)) {
            return;
        }

        /**
         * "id":6, "name":"Gravidade", "value":"5 - Extremamente Grave"
         */
        let gravidade = 0;

        /**
         * "id":7,"name":"Urgencia","value":"5 - Extremamente Urgente"
         */
        let urgencia = 0;

        /**
         * "id":8,"name":"Tendencia","value":"5 - Agravar Rapido"
         */
        let tendencia = 0;

        for (let current = 0; current < issue.custom_fields.length; current++) {

            let customField = issue.custom_fields[current];

            if (![6, 7, 8].inArray(customField.id)) {
                continue;
            }

            if (customField.id == 6) {
                gravidade = customField.value[0];
            }

            if (customField.id == 7) {
                urgencia = customField.value[0];
            }

            if (customField.id == 8) {
                tendencia = customField.value[0];
            }
        }

        let GUT = gravidade * urgencia * tendencia;
        let style = null;

        if (GUT >= 20 && GUT < 40) {
            style = 'color: yellow';
        }

        if (GUT >= 40 && GUT < 60) {
            style = 'color: darkorange';
        }

        if (GUT >= 60 && GUT < 100) {
            style = 'color: brown';
        }

        if (GUT >= 100) {
            style = 'color: red';
        } 

        if (style != null) {

            this.labelStyle[GUT] = style; 
            this.menuStyle[issue.id] = style; 
        }

        this.GUT[issue.id] = GUT; 
    },

    rewind : function() {

        this.labelStyle = []; 
        this.menuStyle = []; 

        for (let current = 0; current < this.listeners.length; current++) {

            this.listeners[current].index = current;
            this.listeners[current].count = 0;
            this.listeners[current].issues = [];
        } 
    },

    updateLabels : function() {

        for (let currentListener = 0; currentListener < this.listeners.length; currentListener++) {

            let listener = this.listeners[currentListener];
            let gut = [0];

            for (let currentIssue = 0; currentIssue < listener.issues.length; currentIssue++) {
                gut.push(this.GUT[listener.issues[currentIssue].id]);
            }

            let max = Math.max.apply(null, gut); 
            let style = this.labelStyle[max] || ';';

            this.labels[currentListener].set_style_class_name('redmine-item');
            this.labels[currentListener].set_style(style);
            this.labels[currentListener].set_text(String(listener.count));
        }
    },

    createLabels : function () {

        for (let current = 0; current < this.listeners.length; current++) {

            let label = new St.Label({style_class: 'redmine-item', text: '0'});
            this.labels[current] = label;
            this.boxLayout.add(label);
        } 
    },

    createMenus : function() {

        this.menu.removeAll();

        for (let currentListener = 0; currentListener < this.listeners.length; currentListener++) {

            let listener = this.listeners[currentListener];
            let title = listener.title + ' (' + listener.count + ')';
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(title, {style_class : 'redmine-title', reactive: false }));

            if (listener.count == 0) {
                continue;
            }

            for (let currentIssue = 0; currentIssue < listener.issues.length; currentIssue++) {

                let issue = listener.issues[currentIssue];
                let subject = issue.subject;
                let GUT = this.GUT[issue.id] || 0;
                let tracker = '';
                if ('tracker' in issue) {
                    tracker = issue.tracker.name.split(' ')[0];
                }

                let titleLink = listener.issueTitleMask
                  .replace('#gut', GUT)
                  .replace('#tracker', tracker)
                  .replace('#subject', issue.subject)
                  .replace('#id', issue.id);

                let link = new PopupMenu.PopupMenuItem(titleLink, {style_class : 'redmine-issue'}); 

                if (this.menuStyle[issue.id]) {
                    link.actor.set_style(this.menuStyle[issue.id]);
                }

                link.connect('activate', Lang.bind(this, function() {
                    execute(this.config.opener + ' ' + this.config.uri + '/issues/' + issue.id);
                }));

                this.menu.addMenuItem(link);
            }

            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        } 
    },

    loadIssues : function() {

      try {

        let file = Gio.file_new_for_uri(this.uriIssues);
        file.load_contents_async(null, function(f, res) {

          try {

            let contents = f.load_contents_finish(res)[1];
            this.issues = JSON.parse(String(contents));

          } catch (error) {
            log('[REDMINE ERROR] loadIssues() 2 : ' + error);
          }

        }.bind(this));

      } catch (error) {
        log('[REDMINE ERROR] loadIssues() 1 : ' + error);
      }

    },

    update : function() {

        this.rewind();
        this.processIssues();
        this.updateLabels();
        this.createMenus();
        this.timeoutId = Mainloop.timeout_add_seconds(this.config.updateTime, Lang.bind(this, this.update));
    },

    onDestroy : function() {

        log('Redmine.destroy()');
        Mainloop.source_remove(this.timeoutId);
    }

}); 

function execute(argv) {

    if (typeof(argv) != 'object') {
        argv = argv.split(' ');
    }

    try {
        GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    } catch (error) {
        log('[REDMINE ERROR] execute() : ' + error);
    }
}

String.prototype.rtrim = function(value) {

    if (value === undefined) {
        let value = ' ';
    }

    let string = new String(this);
    let end = string.length - 1;

    while (string.substr(end) == value) {

        string = new String(this.substr(0, end));
        end = string.length - 1;
    }

    return string;
}   

Array.prototype.inArray = function(value) {  

    for (var index in this) {

        if (this[index] == value ) {
            return true;
        }
    }

    return false;
}

let redmine;

function init(metadata) {

    try {

        if (!redmine) {

            redmine = new Redmine(config);
            Main.panel.addToStatusArea('redmine', redmine);
        }

    } catch (error) {
        log('[REMINE FATAL ERROR] ' + error);
    }
}

function enable() {
    log('Redmine.enabled()');
}

function disable() {

    if (redmine) {

        redmine.destroy();
        redmine = null;
    }
}
