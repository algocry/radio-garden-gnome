const { GObject, St, Clutter, Gio } = imports.gi;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const { playStream, stopStream } = Extension.imports.utils.player;
const { runCommand, showNotification } = Extension.imports.utils.sysUtils;
const { httpRequest, getChannels, getListenUrl, searchRG } = Extension.imports.lib.librgarden;

var RadioExtension = GObject.registerClass(
  class RadioExtension extends PanelMenu.Button {

    _init() {
      super._init(0.0, "Radio");
      this.isOn = false;
      this.isPlaying = false;

      this.channelList = null;
      this.channelIDList = null;

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
      this._buildControllerItems();

      // Create the menu items
      const sep1 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(sep1);

      this._myChannelsMenu = new PopupMenu.PopupMenuItem("My Channels");
      this.menu.addMenuItem(this._myChannelsMenu);

      this._favourite = new PopupMenu.PopupMenuItem("Favourite");
      this.menu.addMenuItem(this._favourite);

      const sep2 = new PopupMenu.PopupSeparatorMenuItem();
      this.menu.addMenuItem(sep2);

      this._buildMenuItems();

    }

    // UI builders
    _buildControllerItems() {
        this._buildControllerItemButtons();
        // settings, add channel and search item
        this.controllerMenu = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        this.controllerMenu.add_child(this.previousButton);
        this.controllerMenu.add_child(this.playButton);
        this.controllerMenu.add_child(this.nextButton);
        this.controllerMenu.add_child(this.powerButton);
        this.menu.addMenuItem(this.controllerMenu);
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

    _buildControllerItemButtons() {
        this.previousIcon = new St.Icon({
            icon_name: 'media-skip-backward-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.previousButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.previousButton.set_child(this.previousIcon);
        this.previousButton.connect('clicked', () => {
            this._stop();
            this._previous();
        });

        this.playIcon = new St.Icon({
            icon_name: 'media-playback-start-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.playButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.playButton.set_child(this.playIcon);
        this.playButton.connect('clicked', () => {
            this._onPlayButtonClicked();
        });

        this.pauseIcon = new St.Icon({
            icon_name: 'media-playback-pause-symbolic',
            style_class: 'popup-menu-icon'
        });

        this.nextIcon = new St.Icon({
            icon_name: 'media-skip-forward-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.nextButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.nextButton.set_child(this.nextIcon);
        this.nextButton.connect('clicked', () => {
            this._stop();
            this._next();
        });

        this.powerIcon = new St.Icon({
            icon_name: 'system-shutdown-symbolic',
            style_class: 'popup-menu-icon'
        });
        this.powerButton = new St.Button({
            style_class: 'radio-menu-action',
            can_focus: true
        });
        this.powerButton.set_child(this.powerIcon);
        this.powerButton.connect('clicked', () => {
            this._powerOn();
        });
    }

    //event handlers
    _updateWithIndex(){
      const index = this.playIndex;
      this.tagListLabel.text = this.channelList[index][1];
      this.playLabel.text = this.channelList[index][0];
      this._play(this.channelIDList[index]);
    }

    _onPlayButtonClicked() {
      if(!this.isOn) return;
      if(this.isPlaying){
        this._stop();
        this.isPlaying = false;
        this.playButton.set_child(this.playIcon);
        return;
      }
      this._updateWithIndex();
      this.isPlaying = true;
      this.playButton.set_child(this.pauseIcon);
    }

    _powerOn(){
      if(this.isOn){
        this.channelList = null;
        this.channelIDList = null;
        this._stop();
        this.isPlaying = false;
        this.playButton.set_child(this.playIcon);
        this.isOn = false;
        if(this.powerButton.has_style_class_name("power-active")){
          this.powerButton.remove_style_class_name("power-active");
        }
        return;
      }
      this.playIndex = 0;
      this.isOn = true;
      searchRG("mirchi")
        .then(json => {
          [ this.channelList, this.channelIDList ] = json;
        })
        .catch(error => {
          const errorMessage = `Error occurred: ${error}`;
          showNotification(errorMessage);
        });
      if(!this.powerButton.has_style_class_name("power-active")){
        this.powerButton.add_style_class_name("power-active");
      }
    }

    // sub-action listeners
    _play(id){
      var url = getListenUrl(id);
      playStream(url);
      showNotification(url);
    }

    _stop(){
      stopStream();
    }

    _next(){
      if(!this.isOn) return;
      if(this.playIndex < this.channelList.length-1){
        this.playIndex++;
        this._updateWithIndex();
        return;
      }
    }

    _previous(){
      if(!this.isOn) return;
      if(this.playIndex>0){
        this.playIndex--;
        this._updateWithIndex();
        return;
      }
    }

    // destructors
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

    _destroyControllerItemButtons() {
        this.previousIcon.destroy();
        this.previousButton.destroy();
        this.playIcon.destroy();
        this.playButton.destroy();
        this.pauseIcon.destroy();
        this.nextIcon.destroy();
        this.nextButton.destroy();
        this.powerIcon.destroy();
        this.powerButton.destroy();
    }

    _destroyMenuItems() {
        this._destroyMenuItemButtons();
        this.separator2.destroy();
        this.settingsItem.destroy();
    }

    _destroyControllerItems(){
      this._destroyControllerItemButtons();
      this.controllerMenu.destroy();
    }

    _finish(){
      // un-_init-ing class
      this.iconStopped.destroy();
      this.iconPlaying.destroy();
      this._radioIcon.destroy();
      this.actor.destroy();
      this.playLabel.destroy();
      this.tagListBox.destroy();
      this.tagItem.destroy();
      this.tagListLabel.destroy();
      this.sep1.destroy();
      this.sep2.destroy();
      this._myChannelsMenu.destroy();
      this._favourite.destroy();
      this.controlsBox.destroy();
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
  radioExtension._destroyMenuItems();
  radioExtension._destroyControllerItems();
  radioExtension._stop();
  radioExtension._finish();
}
