
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Gio = imports.gi.Gio;

const Mainloop = imports.mainloop;


//GLib.spawn_sync(null, ['python', '-c', '"import os"'], null, 4, null)
//GLib.spawn_async

let text, button;

// https://extensions.gnome.org/review/1668
function loop() {

  log('---loop()');
  Mainloop.timeout_add_seconds(1, loop);
  // Mainloop.source_remove(this._timeoutID);
  //GLib.spawn_sync(null, ['python', '-c', '"import os"'], null, 4, null)
}

function getIssues() {

  //GLib.spawn_sync(null, ['python', '-c', '"import os"'], null, 4, null)
  let file = Gio.file_new_for_uri('http://redmine.dbseller:8888/redmine/projects/e-cidade1/issues.json?query_id=18');

  let monitor = file.monitor(Gio.FileMonitorFlags.NONE, null);
  monitor.connect('changed', function() {
       log("\n -------------- Something has happened on URL!");
  });

	let loaded = false;

	try {
		loaded = file.load_contents(null)[0]
	} catch (e if e instanceof URIError) {

		global.logError("Invalid URI:" + file.get_uri())
		return "Invalid Name"
	}

	if (!loaded) {
    return 'error';
  }

  let str = String(file.load_contents(null)[1]);
  let issues = JSON.parse(str).issues;
  return issues;

  for each(issue in issues) {
    log(issue.subject);
  }

  return 'true';
}

function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {

    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: getIssues() });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}

function init() {

  log('___init()');
  // return true;
  // Mainloop.timeout_add_seconds(2000, loop);
  // return;
  //button = new St.Bin({ 
  //  style_class: 'panel-button',
  //  reactive: true,
  //  can_focus: true,
  //  x_fill: true,
  //  y_fill: false,
  //  track_hover: true 
  //});

  //let icon = new St.Icon({
  //  icon_name: 'system-run',
  //    icon_type: St.IconType.SYMBOLIC,
  //    style_class: 'system-status-icon' 
  //});

  //  button.set_child(icon);
  //  button.connect('button-press-event', _showHello);
}

function enable() {
  loop();
  // Mainloop.timeout_add_seconds(5000, loop);
  // Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    // Main.panel._rightBox.remove_child(button);
}
