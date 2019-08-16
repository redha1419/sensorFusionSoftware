## TODO
-> when project is created (list of users is sent), creaeted default user_configs for each of them per project
-> create a PUT route to edit user/project configs
-> GET user/project_config 
-> when project is laoded: get_user_config
users->user_config ()->map of label_ids to color objects : ['255','255','255']
fix labels with new column


#HOLD
#add notes to frames and projects (PUT, POST, DELETE) : params(frame_id, title, status, note, user) : params(project_id, title, status, note, user)

#{
#    project_id/frame_id: "",
#    note:{
#        title:,
#        status:,
#        body:,
#        user
#    }
#}

#response: some_id

#put (note_id, note)

#delete(node_id)

#list_notes(frame_id)

#list_notes(project_id)

#bounding box delete only creator
