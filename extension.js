let config = {

  user : {id : undefined, name : 'Jeferson Belmiro'},
  uri  : 'http://redmine.dbseller:8888/redmine/issues.json?query_id=18',
  updateTime : 60

}; 

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Tweener = imports.ui.tweener;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Pango = imports.gi.Pango;

let redmine;
let text, container, timeoutId, boxLayout, textoNova, textoTeste, textoImpedida, textoAtribuido;

const Redmine = new Lang.Class({

    Name: 'Redmine',
    Extends: PanelMenu.Button,

    _init: function() {

        this.parent(St.Align.START);
        
        // label
        // this.label = new St.Label({ text: '0 | 2 | 4', style_class: 'extension-pomodoro-label' });
        // this.label.clutter_text.set_line_wrap(false);
        // this.label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
        // this.actor.add_actor(this.label);

        textoNova = new St.Label({style_class: 'item', text: '0' });
        textoNova.clutter_text.set_line_wrap(false);
        textoNova.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);

        textoTeste = new St.Label({style_class: 'item', text: '3' });
        textoTeste.clutter_text.set_line_wrap(false);
        textoTeste.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);

        // boxLayout = new St.BoxLayout({vertical: false, style_class: 'panel-button'});
        boxLayout = new St.BoxLayout();
        boxLayout.add(textoNova);
        boxLayout.add(textoTeste);

        this.actor.add_actor(boxLayout);

        
        let sessionCountItem = new PopupMenu.PopupMenuItem('Tarefas novas', { style_class : 'title', reactive: false });
        // sessionCountItem.connect('activate', Lang.bind(this, function() {
        //    execute(['gnome-open', config.uri.replace('.json', '')]);
        // }));
        this.menu.addMenuItem(sessionCountItem);

        this.menu.addMenuItem(new PopupMenu.PopupMenuItem('  89937 - Erro na validação do arquivo do PAD. arquivo 4810 erro "cod. campo registro do funcionário invalido'));
        this.menu.addMenuItem(new PopupMenu.PopupMenuItem('  76388 - arquivo 4810 erro "cod. campo registro do funcionário invalido'));

        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let sessionCountItem = new PopupMenu.PopupMenuItem('Tarefas aceitas', { style_class : 'title', reactive: false });
        this.menu.addMenuItem(sessionCountItem);
        
        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        this.connect('destroy', Lang.bind(this, this._onDestroy));
    },

    _onDestroy: function() {
        log('Redmine::_destroy()');
    }

}); 

function init(metadata) {

  try {

    if (!redmine) {
      redmine = new Redmine();
      Main.panel.addToStatusArea('redmine', redmine);
    }
  } catch (erro) {
    log('Remine error: ' + erro);
  }
  // Main.panel._rightBox.insert_child_at_index(indicator, 0);

  log('init()');

  //textoNova = new St.Label({style_class: 'item item-nova', text: '?' });
  //textoTeste = new St.Label({style_class: 'item item-teste', text: '?' });
  //textoImpedida = new St.Label({style_class: 'item item-impedida', text: '?' });
  //textoAtribuido = new St.Label({style_class: 'item item-atribuido', text: '?' });

  //container = new St.Bin({ 
  //  style_class: 'panel-button',
  //  reactive: true,
  //  can_focus: true,
  //  x_fill: true,
  //  y_fill: false,
  //  track_hover: true
  //});

  //boxLayout = new St.BoxLayout({vertical: false, style_class: 'panel-button'});
  //boxLayout.add(textoNova);
  //boxLayout.add(textoTeste);
  //boxLayout.add(textoImpedida);
  //boxLayout.add(textoAtribuido);

  //container.set_child(boxLayout);
  //container.connect('button-press-event', function() {
  //  execute(['gnome-open', config.uri.replace('.json', '')]);
  //});
  //loop();
}

function enable() {

  // Main.panel._rightBox.insert_child_at_index(container, 0);
  log('enabled()');
}

function disable() {

  Main.panel._rightBox.remove_child(container);
  Mainloop.source_remove(timeoutId);

  if (redmine) {
    redmine.destroy();
    redmine = null;
  }
  log('disable()');
}

function loop() {

  let issues = getIssues();

  if (!issues) {

    timeoutId = Mainloop.timeout_add_seconds(config.updateTime, loop);
    return;
  }

  let contador = {
    nova: 0,
    teste : 0,
    impedida : 0,
    atribuido: 0
  };

  for each(item in issues.issues) {

    if ('assigned_to' in item) {

      if (item.assigned_to.id == config.user.id || item.assigned_to.name.toLowerCase().indexOf(config.user.name) !== -1) {

        contador.atribuido++;
        continue;
      }
    }

    if ('status' in item) {

      /**
       * Tarefa impedida
       */
      if (item.status.id == 12) {

        contador.impedida++;
        continue;
      } 

      /**
       * Tarefa em teste
       */
      if (item.status.name.toLowerCase().indexOf('teste') !== -1) {

        contador.teste++;
        continue;
      } 

      /**
       * Tarefa nova ou aguardando inicio
       */
      if (item.status.id == 8 || item.status.name.toLowerCase().indexOf('nova') !== -1) {

        contador.nova++;
        continue;
      } 
    }
  } 

  textoAtribuido.remove_style_class_name('red');
  textoImpedida.remove_style_class_name('red');

  if (contador.atribuido > 1) {
    textoAtribuido.add_style_class_name('red');
  }

  if (contador.impedida > 0) {
    textoImpedida.add_style_class_name('red');
  }

  textoNova.set_text('' + contador.nova);
  textoTeste.set_text('' + contador.teste); 
  textoImpedida.set_text('' + contador.impedida); 
  textoAtribuido.set_text('' + contador.atribuido); 

  timeoutId = Mainloop.timeout_add_seconds(config.updateTime, loop);
}

function getIssues() {

  let file = Gio.file_new_for_uri(config.uri);

	try {
	  file.load_contents(null)[0]
	} catch (e if e instanceof URIError) {
    return false;
	}

  let str = String(file.load_contents(null)[1]);
  return JSON.parse(str);
}

function execute(argv) {

  if (typeof(argv) != 'object') {
    argv = argv.split(' ');
  }

  try {
    GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
  } catch (err) {
    log(err);
  }
}
