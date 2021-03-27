import { Meteor } from 'meteor/meteor';
import { FeaturesCollection } from '/imports/api/FeaturesCollection';

const insertFeature = (feature) => FeaturesCollection.insert(feature);
 
Meteor.startup(() => {
  if (FeaturesCollection.find().count() === 0) {
    [
      {id: "1", pi: "1", name: "bla", size: 10},{id: "2", pi: "1", name: "vrot", size: 20},{id: "3", pi: "1", name: "test123", size:50},
      {id: "4", pi: "2", name: "bla", size: 100},{id: "5", pi: "2", name: "vrot", size: 30},{id: "6", pi: "2", name: "test123", size:10},
      {id: "7", pi: "3", name: "bla", size: 70},{id: "8", pi: "3", name: "vrot", size: 70},{id: "9", pi: "3", name: "test123", size:5},
      {id: "10", pi: "4", name: "bla", size: 20},{id: "11", pi: "4", name: "vrot", size: 86},{id: "12", pi: "4", name: "test123", size:75}
    ].forEach(insertFeature);
  }
});