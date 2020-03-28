"use strict";

//libs
const express = require('express');
const router  = new express.Router();
const knex    = require('../../db/knex');
const _ = require('lodash')

			
			
/*
-------------------------------POST---------------------------------
*/			

/*
body = {
    projectID: "",
    class_names: "",
    labels = [
        {
            current_node: "",
            parent_node: "",
            label_name: ""
        },
        {
            current_node: "",
            parent_node: "",
            label_name: ""
        }
    ]
}
*/

router.post('/label', function(req,res){
    let projectID = req.body.projectID;
    let given_labels = req.body.labels;
    let labels_to_insert = [];
    var group_name = "";
    
    //let group_name = given_labels.find(obj => {return obj.parent_node === -1}).label_name;
    for(let i=0; i<given_labels.length; i++){
        if(given_labels[i].parent_node === "-1"){
            group_name = given_labels[i].label_name;
        }
    }

    
    if(group_name == undefined || group_name == ""){
        res.status(500).json({message: "Did not provide a parent node"});
        return
    }
    for(let i=0; i<given_labels.length; i++){
        labels_to_insert.push(
            {
                current_node: given_labels[i].current_node,
                label_name:  given_labels[i].label_name,
                parent_node: given_labels[i].parent_node,
                group_name: group_name,
                project_id: projectID,
                label_type: given_labels[i].label_type,
                has_children: given_labels[i].has_children
            }
        )
    }
    knex('labels')
    .insert(labels_to_insert)
    .returning(['*'])
    .then(labels => {
        // inserted labels
        knex('users_projects')
        .where({
            project_id: projectID
        })
        .update({label_colors: req.body.class_names})
        .then(()=>{
            console.log(labels)
            res.status(200).json({message: "Succesfully Inserted labels"})
        })
    })
    .catch(err=>{
        res.status(500).json({message: err.message, stack:err.stack});
    })
});


/*
-------------------------------GET---------------------------------
*/	


router.get('/label', function(req, res){
    let projectID = req.body.projectID;
    knex('labels')
    .where('project_id', projectID)
    .then(labels => {
        //group them by group name and send back
        let grouped = _.mapValues(_.groupBy(labels, 'group_name'), llist => llist.map(label => _.omit(label, 'group_name')));
        res.status(200).json(grouped);
    })
    .catch(err=>{
        res.status(500).json({message: err.message, stack:err.stack});
    })
});

module.exports = router;