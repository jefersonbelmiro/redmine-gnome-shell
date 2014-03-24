
const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Tweener = imports.ui.tweener;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;

let text, button, timeoutId, issues;
let boxLayout;
let textoBug, textoAcerto, textoTeste, textoAtribuido;






function Redmine() {
    this.__construct.apply(this, arguments);
}

Redmine.prototype = {

    issues : {},

    __construct : function(uri) {

        let file = Gio.file_new_for_uri(uri);
        let loaded = file.load_contents(null)[0];

        if (!loaded) {
            throw Error("Error on load URI");
        }

        let str = String(file.load_contents(null)[1]);
        this.issues = JSON.parse(str); 
    },

    find : function(listeners) {

        // for each
        listener = listeners[0];

        for each(item in this.issues.issues) {

            if ('project' in item) {

                if (listener.project.id != null) {
                    if (item.project.id == listener.project.id) {
                        listener.count++;
                    }
                }
                if (listener.project.name != null) {
                    if (item.project.name == listener.project.name) {
                        listener.count++;
                    }
                }
            } 

            /**
             * tracker - tipo de tarefa
             */
            if ('tracker' in item) {

                if (listener.tracker.id != undefined) { 
                    if (this.seek(item.tracker.id, listener.tracker.id, listener.method)) {
                        listener.count++;
                    }
                }
                if (listener.tracker.name != null) {
                    if (item.tracker.name == listener.tracker.name) {
                        listener.count++;
                    }
                }
            }

            /**
             * status - situação da tarefa
             */
            if ('status' in item) {
                if (listener.status.id != null) {
                    if (item.status.id == listener.status.id) {
                        listener.count++;
                    }
                }
                if (listener.status.name != null) {
                    if (item.status.name == listener.status.name) {
                        listener.count++;
                    }
                }
            }

            if ('priority' in item) {
                if (listener.priority.id != null) {
                    if (item.priority.id == listener.priority.id) {
                        listener.count++;
                    }
                }
                if (listener.priority.name != null) {
                    if (item.priority.name == listener.priority.name) {
                        listener.count++;
                    }
                }
            }

            if ('author' in item) {
                if (listener.author.id != null) {
                    if (item.author.id == listener.author.id) {
                        listener.count++;
                    }
                }
                if (listener.author.name != null) {
                    if (item.author.name == listener.author.name) {
                        listener.count++;
                    }
                }
            }

            if ('assigned_to' in item) {
                if (listener.assigned_to.id != null) {
                    if (item.assigned_to.id == listener.assigned_to.id) {
                        listener.count++;
                    }
                }
                if (listener.assigned_to.name != null) {
                    if (item.assigned_to.name == listener.assigned_to.name) {
                        listener.count++;
                    }
                }
            }

            if ('fixed_version' in item) {
                if (listener.fixed_version.id != null) {
                    if (item.fixed_version.id == listener.fixed_version.id) {
                        listener.count++;
                    }
                }
                if (listener.fixed_version.name != null) {
                    if (item.fixed_version.name == listener.fixed_version.name) {
                        listener.count++;
                    }
                }
            }

            if ('subject' in item) {
                if (listener.subject != null) {
                    if (item.subject == listener.subject) {
                        listener.count++;
                    }
                }
            }

            if ('description' in item) {
                if (listener.description != null) {
                    if (item.description == listener.description) {
                        listener.count++;
                    }
                }
            }

        } // foreach 

    },

    seek : function(value, find, method) {

        let result = false;
        let deny = false;

        if (method.indexOf('!') === 0) {

            method = method.slice(1);
            deny = true;
        }
    
        switch (method) {
        
            case 'ilike' :
                if (value.toLowerCase().indexOf(find) !== -1) result = deny ? false : true;
            beak;

            case 'like' :
                if (value.indexOf(find) !== -1) result = deny ? false : true;
            beak;

            case '=' :
                if (value == find) result = deny ? false : true;
            beak;
        
        }

        return result;
    }

}; 

function Layout() {
    this.__construct.apply(this, arguments);
}

Layout.prototype = {

    button : null,
    container : null,
    elements : [],

    __construct : function() {
        this.create();
    },

    create : function() {

        this.button = new St.Bin({ 
            style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            x_fill: true,
            y_fill: false,
            track_hover: true,
        });

        this.container = new St.BoxLayout({vertical: false, style_class: 'box-container'});
    },

    add : function(element) {
        this.elements.push(element);
    },

    render : function() {

        for Each(element in this.elements) {
            this.container.add(element);
        }

        this.button.set_child(this.container);
        Main.panel._rightBox.insert_child_at_index(this.button, 0);
    }

    clear : function() {

        this.elements = [];
        Main.panel._rightBox.remove_child(button);
    }

};



function init(metadata) {

    textoBug = new St.Label({style_class: 'item item-bug', text: '.' });
    textoAcerto = new St.Label({style_class: 'item item-acerto', text: '.' });
    textoTeste = new St.Label({style_class: 'item item-teste', text: '.' });
    textoAtribuido = new St.Label({style_class: 'item item-atribuido', text: '.' });

    button = new St.Bin({ 
        style_class: 'panel-button',
        reactive: true,
        can_focus: true,
        x_fill: true,
        y_fill: false,
        track_hover: true,
    });

    boxLayout = new St.BoxLayout({vertical: false, style_class: 'box-container'});
    boxLayout.add(textoBug);
    boxLayout.add(textoAcerto);
    boxLayout.add(textoTeste);
    boxLayout.add(textoAtribuido);

    button.set_child(boxLayout);
    loop();
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
    Mainloop.source_remove(timeoutId);
}

function loop() {

    issues = getIssues();

    let itens = {
        bug: 0,
        acerto: 0,
        teste : 0,
        assigned : 0,
        total : 0
    };

    for each(item in issues.issues) {

        let tracker     = '';
        let status      = '';
        let priority    = '';
        let assignedTo  = '';
        let subject     = '';
        let description = '';

        if ('tracker' in item) 
            tracker = item.tracker.name;

        if ('status' in item) 
            status = item.status.name;

        if ('priority' in item)
            priority = item.priority.name;

        if ('assigned_to' in item) 
            assignedTo = item.assigned_to.name;

        if ('subject' in item) 
            subject = item.subject;

        if ('description' in item) 
            description = item.description;

        if (assignedTo.toLowerCase().indexOf('jeferson belmiro') !== -1) {
            itens.assigned++;
        }

        if (status.toLowerCase().indexOf('teste') !== -1) {
            itens.teste++;
        }

        if (tracker.toLowerCase().indexOf('bug') !== -1) {
            itens.bug++;
        }

        if (tracker.toLowerCase().indexOf('acerto') !== -1) {
            itens.acerto++;
        }

    } 

    textoBug.set_text('' + itens.bug);
    textoAcerto.set_text('' + itens.acerto); 
    textoTeste.set_text('' + itens.teste); 
    textoAtribuido.set_text('' + itens.assigned); 

    timeoutId = Mainloop.timeout_add_seconds(10, loop);
    // timeoutId = Mainloop.timeout_add(10000, loop);
}

function getIssues() {

    let file = Gio.file_new_for_uri('http://redmine.dbseller:8888/redmine/issues.json?query_id=18');
    let loaded = false;

    try {
        loaded = file.load_contents(null)[0]
    } catch (e if e instanceof URIError) {

        global.logError("Invalid URI:" + file.get_uri());
        return "Invalid Name";
    }

    if (!loaded) {
        return global.logError("Error");
    }

    let str = String(file.load_contents(null)[1]);
    let issues = JSON.parse(str);
    return issues;
}



function isset() {

  var a = arguments, l = a.length, i = 0, undef;

  if (l === 0) {
    throw new Error('Empty isset');
  }

  while (i !== l) {
    if (a[i] === undef || a[i] === null) {
      return false;
    }
    i++;
  }
  return true;
}

function empty(mixed_var) {

  var undef, key, i, len;
  var emptyValues = [undef, null, false, 0, '', '0'];

  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixed_var === emptyValues[i]) {
      return true;
    }
  }

  if (typeof mixed_var === 'object') {
    for (key in mixed_var) {
      return false;
    }
    return true;
  }

  return false;
}
