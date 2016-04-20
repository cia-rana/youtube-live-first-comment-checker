var commentObserver = {
    Start: function(){
        function thickenComments(comment){
            var channelId = $(comment).children('a.avatar:first').attr('href');
            if(!channelIdSet.has(channelId)){
              channelIdSet.add(channelId);
              $(comment).find('div.comment-text:first').css("font-weight", "bold");
              $(comment).find('a.yt-user-name:first').css("font-weight", "bold").css("color", "#666666");
            }
        }
        function thickenCommentsEvent(mutations){
            mutations.forEach(function(comments){
                var addedNodes = comments.addedNodes;
                for(var i=0; i<addedNodes.length; i++){
                    thickenComments(addedNodes.item(i));
                }
            });
        }
        var channelIdSet = new Set();
        
        var options = {
            attributes: true,
            attributeFilter: ['li.comment'],
            childList: true
        }
        commentObserver.mo = new MutationObserver(thickenCommentsEvent);
        commentObserver.mo.observe(domAllComments[0], options);
        
        // Observer開始時に一度全コメントを走査する
        $('li.comment').each(function(i, li){
            thickenComments(li);
        });
    },
    Stop: function(){
        commentObserver.disconnect();
    }
}

var domAllComments = null;
var domAllCommentsWait = function(){
    domAllComments = $('ul#all-comments');
    if(domAllComments.size() > 0){
        clearInterval(domAllCommentsWaitId);
        commentObserver.Start();
    }
};
var domAllCommentsWaitId = setInterval(domAllCommentsWait, 500);