const { GObject, St, Clutter, Gio } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const { playStream, stopStream } = Extension.imports.utils.player;

var RadioExtension = GObject.registerClass(
  class RadioExtension extends PanelMenu.Button {

    _init() {
      super._init(0.0, "Radio");
      this.isPlaying = false;

      this.iconStopped = Gio.icon_new_for_string(Extension.path + '/icons/gser-icon-stopped-symbolic.svg');
      this.iconPlaying = Gio.icon_new_for_string(Extension.path + '/icons/gser-icon-playing-symbolic.svg');

      // Create the radio icon
      this._radioIcon = new St.Icon({
        gicon: this.iconStopped,
        style_class: "system-status-icon"
      });
      this.actor.add_actor(this._radioIcon);

      // Box for the Control Elements
      this.controlsBox = new St.BoxLayout({
          name: 'controlsBox',
          style_class: 'control-box',
          width: 350
      });

      // Play and Stop Button Images
      this.playIcon = new St.Icon({
          icon_name: 'media-playback-start-symbolic',
          style_class: 'popup-menu-icon'
      });
      this.stopIcon = new St.Icon({
          icon_name: 'media-playback-stop-symbolic',
          style_class: 'popup-menu-icon'
      });

      // Play - Stop Button
      this.playButton = new St.Button({
          style_class: 'radio-menu-action',
          can_focus: true
      });

      // Set the Icon of the Button
      this.playButton.set_child(this.playIcon);

      // Currently Played Label
      this.playLabel = new St.Label({
          text: "Station",
          style_class: 'play-label'
      });

      this.tagListBox = new St.BoxLayout({
          name: 'tagListBox',
          style_class: 'tag-list-box'
      });

      this.tagItem = new PopupMenu.PopupBaseMenuItem({
          reactive: false,
          can_focus: false
      });


      // Add Button to the BoxLayout
      this.controlsBox.add(this.playButton);
      this.controlsBox.add(this.playLabel);

      // tagListlabel
      this.tagListLabel = new St.Label({
          text: "Location"
      });

      this.tagListBox.add(this.tagListLabel);


      // Add ControlsBox to the Menu
      this.menu.box.add_child(this.controlsBox);
      this.tagItem.add_child(this.tagListBox);
      this.menu.addMenuItem(this.tagItem);

      // Connect the Button
      this.playButton.connect('clicked', this._onPlayButtonClicked.bind(this));

      // Create the menu items
      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      this._previousItem = new PopupMenu.PopupMenuItem("Previous");
      this.menu.addMenuItem(this._previousItem);

      this._playPauseItem = new PopupMenu.PopupMenuItem("Play/Pause");
      this.menu.addMenuItem(this._playPauseItem);

      this._nextItem = new PopupMenu.PopupMenuItem("Next");
      this.menu.addMenuItem(this._nextItem);

      this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

      this._buildMenuItems();

    }

    _onPlayButtonClicked() {
      if(this.isPlaying){
        this._stop();
        this.isPlaying = false;
        this.playButton.set_child(this.playIcon);
        this.tagListLabel.text = "Location 2";
        return;
      }
      this._play();
      this.isPlaying = true;
      this.playButton.set_child(this.stopIcon);

    }

    _buildMenuItems() {
        // PopupSeparator
        this.separator2 = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(this.separator2);

        this._buildMenuItemButtons();
        // settings, add channel and search item
        this.settingsItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        this.settingsItem.add_child(this.settingsButton);
        this.settingsItem.add_child(this.channelListButton);
        this.settingsItem.add_child(this.addChannelButton);
        this.settingsItem.add_child(this.searchButton);
        this.menu.addMenuItem(this.settingsItem);
    }

    _destroyMenuItems() {
        this._destroyMenuItemButtons();
        this.separator2.destroy();
        this.settingsItem.destroy();
    }

    _buildMenuItemButtons() {
        this.settingsIcon = new St.Icon({
            icon_name: 'preferences-system-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.settingsButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.settingsButton.set_child(this.settingsIcon);
        this.settingsButton.connect('clicked', () => {
            this.menu.close();
            //this._openPrefs();
        });

        this.channelListIcon = new St.Icon({
            icon_name: 'view-list-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.channelListButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.channelListButton.set_child(this.channelListIcon);
        this.channelListButton.connect('clicked', () => {
            this.menu.close();
            //this.channelListDialog = new ChannelListDialog.ChannelListDialog();
            //this.channelListDialog.open();
        });

        this.addChannelIcon = new St.Icon({
            icon_name: 'list-add-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.addChannelButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.addChannelButton.set_child(this.addChannelIcon);
        this.addChannelButton.connect('clicked', () => {
            this.menu.close();
            //this.addChannelDialog = new AddChannelDialog.AddChannelDialog(null);
            //this.addChannelDialog.open();
        });

        this.searchIcon = new St.Icon({
            icon_name: 'system-search-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.searchButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.searchButton.set_child(this.searchIcon);
        this.searchButton.connect('clicked', () => {
            this.menu.close();
            //this.searchDialog = new SearchDialog.SearchDialog();
            //this.searchDialog.open();
        });
    }

    _destroyMenuItemButtons() {
        this.settingsIcon.destroy();
        this.settingsButton.destroy();
        this.channelListIcon.destroy();
        this.channelListButton.destroy();
        this.addChannelIcon.destroy();
        this.addChannelButton.destroy();
        this.searchIcon.destroy();
        this.searchButton.destroy();
    }

    _play(){
      playStream("http://radio.garden/api/ara/content/listen/ZhLY6m3C/channel.mp3");
    }

    _stop(){
      stopStream();
    }
  }
);

function init() {
  // do nothing
}

function enable() {
  let radioExtension = new RadioExtension();
  Main.panel.addToStatusArea("radio-extension", radioExtension);
}

function disable() {
  Main.panel.statusArea["radio-extension"].destroy();
}
