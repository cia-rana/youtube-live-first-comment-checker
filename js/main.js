(function(){
var usernamesShowLabel = "ユーザー名を表示";
var usernamesHideLabel = "ユーザー名を非表示";
var usernamesWidth = 100;
chrome.storage.local.get("usernamesWidth", function(value){
    valueUsernamesWidth = value.usernamesWidth;
    if(valueUsernamesWidth !== void 0){
        usernamesWidth = parseInt(valueUsernamesWidth);
    }
});

function putOutUsername(comment){
    $(comment).find('div.content>span.byline:first')
    .resizable({
        handles: 'e',
        resize: function(event, ui){
          var width = ui.size.width;
          $('li.comment').each(function(i, li){
              resizeUsernameWidth(li, width);
          });
        },
        stop: function(event, ui){
            usernamesWidth = ui.size.width;
            chrome.storage.local.set(
                {"usernamesWidth": String(usernamesWidth)}
            );
        },
    })
    .css('min-height', '24px')
    .css('width', '100px')
    .css('white-space', 'nowrap')
    .css('overflow', 'hidden')
    .css('text-overflow', 'ellipsis')
    .insertAfter($(comment).find('a.avatar'));
    
    $(comment).find('span.byline>span.author>a.yt-user-name:first')
    .css('min-width', '100px');
    
    $(comment).find('div.content')
    .css('width', '1px');
}

function resizeUsernameWidth(comment, width){
    $(comment).find('span.byline:first')
    .css('width', width + 'px')
}

var commentObserver = {
    Start: function(){
        function commentsEvent(mutations){
            mutations.forEach(function(mutation){
                var addedNodes = mutation.addedNodes;
                for(let i=0; i<addedNodes.length; i++){
                    thickenComment(addedNodes.item(i));
                    putOutUsername(addedNodes.item(i));
                    resizeUsernameWidth(addedNodes.item(i), usernamesWidth);
                }
            });
        }
        function thickenComment(comment){
            var channelId = $(comment).attr('data-author-id');
            if(!channelIdSet.has(channelId)){
              channelIdSet.add(channelId);
              $(comment).find('div.comment-text:first').css("font-weight", "bold");
              $(comment).find('a.yt-user-name:first').css("font-weight", "bold").css("color", "#666666");
            }
        }
        var channelIdSet = new Set();
        
        commentObserver.mo = new MutationObserver(commentsEvent);
        commentObserver.mo.observe(domAllComments[0], {
            attributeFilter: ['li.comment'],
            childList: true
        });
        
        // Observer開始時に一度全コメントを走査する
        $('li.comment').each(function(i, li){
            thickenComment(li);
            putOutUsername(li);
        });
    },
    Stop: function(){
        commentObserver.mo.disconnect();
    }
}

var domAllComments = null;
function waitDomAllComments(){
    domAllComments = $('ul#all-comments');
    
    // コメント欄が読み込まれた場合
    if(domAllComments.size() > 0){
        clearInterval(domAllCommentsWaitingId);
        commentObserver.Start();
    }
};
// コメント欄が読み込まれるまでインターバルをまわす
var domAllCommentsWaitingId = setInterval(waitDomAllComments, 500);
})();
