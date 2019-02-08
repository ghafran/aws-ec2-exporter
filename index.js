
var _ = require('lodash'),
    promise = require('bluebird'),
    AWS = require('aws-sdk'),
    createCsvWriter = require('csv-writer').createObjectCsvWriter;

AWS.config.region = 'us-gov-west-1';

var ec2 = new AWS.EC2();
const csvWriter = createCsvWriter({
    path: __dirname + '/instances.csv',
    header: [
        {id: 'InstanceId', title: ' InstanceId'},
        {id: 'InstanceType', title: 'InstanceType'},
        {id: 'AZ', title: 'Placement'},
        {id: 'PrivateIpAddress', title: 'PrivateIpAddress'},
        {id: 'VpcId', title: 'VpcId'},
        {id: 'SubnetId', title: 'SubnetId'},
        {id: 'SecurityGroups', title: 'SecurityGroups'},
        {id: 'Name', title: 'Name'},
        {id: 'Deployment', title: 'Deployment'},
        {id: 'InstanceGroup', title: 'InstanceGroup'}
    ]
});

ec2.describeInstances((err, data) => {
    if(err){
        console.error(err);
    } else {
        var records = [];
        _.each(data.Reservations, (reservation)=>{
            _.each(reservation.Instances, (instance)=>{

                var name = _.find(instance.Tags, { Key: 'Name'});
                var deployment = _.find(instance.Tags, { Key: 'deployment'});
                var instance_group = _.find(instance.Tags, { Key: 'instance_group'});

                records.push({
                    InstanceId: instance.InstanceId,
                    InstanceType: instance.InstanceType,
                    AZ: instance.Placement.AvailabilityZone,
                    VpcId: instance.VpcId,
                    SubnetId: instance.SubnetId,
                    SecurityGroups: _.map(instance.SecurityGroups, 'GroupName').join(', '),
                    Name: name ? name.Value : '',
                    Deployment: instance_group ? instance_group.Value : '',
                    InstanceGroup: instance.InstanceId
                });
            });  
        });
        
        csvWriter.writeRecords(records).then(()=>{
            console.log('Done.');
        });
    }
});