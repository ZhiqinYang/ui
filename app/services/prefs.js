import Ember from 'ember';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

export default Ember.Service.extend({
  unremoved: function() {
    return UnremovedArrayProxy.create({
      sourceContent: this.get('userStore').all('userpreference')
    });
  }.property('userStore.generation'),

  findByName: function(key) {
    return this.get('unremoved').filterBy('name',key)[0];
  },

  unknownProperty: function(key) {
    var value; // = undefined;

    var existing = this.findByName(key);
    if ( existing )
    {
      try
      {
        value = JSON.parse(existing.get('value'));
      }
      catch (e)
      {
        console.log("Error parsing storage ['"+key+"']");
        //this.notifyPropertyChange(key);
      }
    }

    return value;
  },

  setUnknownProperty: function(key, value) {
    var obj = this.findByName(key);

    // Delete by set to undefined
    if ( value === undefined )
    {
      if ( obj )
      {
        obj.set('value',undefined);
        obj.delete();
        this.notifyPropertyChange(key);
      }

      return;
    }

    if ( !obj )
    {
      obj = this.get('userStore').createRecord({
        type: 'userPreference',
        name: key,
      });
    }

    obj.set('value', JSON.stringify(value));
    obj.save().then(() => {
      Ember.run(() => {
        this.notifyPropertyChange(key);
      });
    });
    return value;
  },

  clear: function() {
    this.beginPropertyChanges();

    this.get('unremoved').forEach((obj) => {
      this.set(obj.get('name'), undefined);
    });

    this.endPropertyChanges();
  },
});
