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
    class_names: "what ever this is can be anything",
    labels = [
        {
            current_node: "",
            parent_node: "",
            label_name: "",
            label_type: "",
            has_children: ""
        },
        {
            current_node: "",
            parent_node: "",
            label_name: "",
            label_type: "",
            has_children: ""
        }
    ]
}
*/

function getLabels(projectID, obj){
    let group_name = obj.group_name;
    let nodes = obj.nodes;
    let labels_to_insert = [];
    for(let i=0; i<nodes.length; i++){
        labels_to_insert.push(
            {
                current_node: nodes[i].current_node,
                label_name:  nodes[i].label_name,
                parent_node: nodes[i].parent_node,
                group_name: group_name,
                project_id: projectID,
                label_type: nodes[i].label_type,
                has_children: nodes[i].has_children
            }
        )
    }
    return labels_to_insert;
}

router.post('/label', function(req,res){
    let projectID = req.body.projectID;
    let given_labels = req.body.class_names;
    let labels_to_insert = [];
    

    for(let i=0; i<given_labels.objects.length; i++){
        labels_to_insert.concat(getLabels(projectID, given_labels.objects[i]));
    }
    
    console.log(labels_to_insert);

    knex('labels')
    .insert(labels_to_insert)
    .returning(['*'])
    .then(labels => {
        // inserted labels
        /*
        knex('users_projects')
        .where({
            project_id: projectID
        })
        .update({label_colors: req.body.class_names})
        .then(()=>{
        */
            //console.log(labels)
            res.status(200).json({message: "Succesfully Inserted labels"})
       // })
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