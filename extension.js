let config = {

  user : {id : undefined, name : 'Jeferson Belmiro'},
  uri  : 'http://redmine.dbseller:8888/redmine/issues.json?query_id=18',
  browser : 'google-chrome',
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

let text, container, timeoutId, boxLayout, textoNova, textoTeste, textoImpedida, textoAtribuido;

function init(metadata) {

  log('init()');

  textoNova = new St.Label({style_class: 'item item-nova', text: '?' });
  textoTeste = new St.Label({style_class: 'item item-teste', text: '?' });
  textoImpedida = new St.Label({style_class: 'item item-impedida', text: '?' });
  textoAtribuido = new St.Label({style_class: 'item item-atribuido', text: '?' });

  container = new St.Bin({ 
    style_class: 'panel-button',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true
  });

  boxLayout = new St.BoxLayout({vertical: false, style_class: 'panel-button'});
  boxLayout.add(textoNova);
  boxLayout.add(textoTeste);
  boxLayout.add(textoImpedida);
  boxLayout.add(textoAtribuido);

  container.set_child(boxLayout);
  container.connect('button-press-event', function() {
    execute([config.browser, config.uri.replace('.json', '')]);
  });
  loop();
}

function enable() {

  log('enabled()');
  Main.panel._rightBox.insert_child_at_index(container, 0);
}

function disable() {

  log('disable()');
  Main.panel._rightBox.remove_child(container);
  Mainloop.source_remove(timeoutId);
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

  try {
    GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
  } catch (err) {
    log(err);
  }
}
