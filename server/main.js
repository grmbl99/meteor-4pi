import { Meteor } from 'meteor/meteor';
import { FeaturesCollection } from '/imports/api/FeaturesCollection';

const insertFeature = (feature) => FeaturesCollection.insert(feature);
 
Meteor.startup(() => {
  if (FeaturesCollection.find().count() === 0) {
    [
      {pi: "1", name: "bla", size: 10},{pi: "1", name: "vrot", size: 20},{pi: "1", name: "test123", size:50},
      {pi: "2", name: "bla", size: 100},{pi: "2", name: "vrot", size: 30},{pi: "2", name: "test123", size:10},
      {pi: "3", name: "bla", size: 70},{pi: "3", name: "vrot", size: 70},{pi: "3", name: "test123", size:5},
      {pi: "4", name: "bla", size: 20},{pi: "4", name: "vrot", size: 86},{pi: "4", name: "test123", size:75}
    ].forEach(insertFeature);
  }
});