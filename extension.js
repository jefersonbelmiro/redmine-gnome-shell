/**
 * Configurações
 */
let config = {

    /**
     * Caminho do redmine
     */
    uri : 'http://redmine.dbseller:8888/redmine',

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
    opener : 'gnome-open',

    /**
     * Contadores das tarefas
     */
    listeners : [

        {
            title : 'Tarefas novas',
            status : {name : 'Nova'}
        },

        {
            title : 'Tarefas aceitas',
            status : {name : 'Aceita'}
        },

        {
            title : 'Tarefas impedidas',
            status : {id : 12, name : 'Impedida'}
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

        this.menuStyleClass = [];
        this.labelStyleClass = [];

        this.uriIssues = this.config.uri.rtrim('/') + '/issues.json';

        if ('uriQueryString' in this.config) {
            this.uriIssues += '?' + this.config.uriQueryString;
        }

        this.createLabels();
        this.update();

        this.actor.add_actor(this.boxLayout);
        this.connect('destroy', Lang.bind(this, this.onDestroy));
    },

    processIssues : function () {

        let issues = this.getIssues();

        if (!('issues' in issues)) {
            return;
        }

        for (let currentIssue = 0; currentIssue < issues.issues.length; currentIssue++) {

            let issue = issues.issues[currentIssue];

            for (let currentListener = 0; currentListener < this.listeners.length; currentListener++) {

                let listener = this.listeners[currentListener];

                if (this.seek(issue, listener)) {

                    this.colorize(issue, listener);
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

    colorize : function(issue, listener) {

        if ('custom_fields' in issue) {

            let customFound = 0;

            for (let current = 0; current < issue.custom_fields.length; current++) {

                if (issue.custom_fields[current].value.indexOf('5') === 0) {
                    customFound++;
                }
            }

            if (customFound >= 3) { 

                this.labelStyleClass[listener.index] = 'red'; 
                this.menuStyleClass[issue.id] = 'red'; 
            }
        }
    },

    rewind : function() {

        this.labelStyleClass = []; 
        this.menuStyleClass = []; 

        for (let current = 0; current < this.listeners.length; current++) {

            this.listeners[current].index = current;
            this.listeners[current].count = 0;
            this.listeners[current].issues = [];
        } 
    },

    updateLabels : function() {

        for (let current = 0; current < this.listeners.length; current++) {

            let styleClass = this.labelStyleClass[current] || '';
            this.labels[current].set_style_class_name('item ' + styleClass);
            this.labels[current].set_text(String(this.listeners[current].count));
        }
    },

    createLabels : function () {

        for (let current = 0; current < this.listeners.length; current++) {

            let label = new St.Label({style_class: 'item', text: '0'});

            this.labels[current] = label;
            this.boxLayout.add(label);
        } 
    },

    createMenus : function() {

        this.menu.removeAll();

        for (let currentListener = 0; currentListener < this.listeners.length; currentListener++) {

            let listener = this.listeners[currentListener];
            let title = listener.title + ' (' + listener.count + ')';
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(title, {style_class : 'title', reactive: false }));

            if (listener.count == 0) {
                continue;
            }

            for (let currentIssue = 0; currentIssue < listener.issues.length; currentIssue++) {

                let issue = listener.issues[currentIssue];
                let styleClass = this.menuStyleClass[issue.id] || '';
                let title = issue.subject;
                if ('tracker' in issue) {
                    title = '[' + issue.tracker.name.split(' ')[0] + '] ' + issue.subject;
                }
                let link = new PopupMenu.PopupMenuItem(title, {style_class : 'issue ' + styleClass}); 
                link.connect('activate', Lang.bind(this, function() {
                    execute(this.config.opener + ' ' + this.config.uri + '/issues/' + issue.id);
                }));

                this.menu.addMenuItem(link);
            }

            this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        } 
    },

    getIssues : function() {

        try {

            let file = Gio.file_new_for_uri(this.uriIssues);
            let loaded = file.load_contents(null)[0];
            if (!loaded) throw 'Error';
            return JSON.parse(String(file.load_contents(null)[1]));

        } catch (error) {
            return {};
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
