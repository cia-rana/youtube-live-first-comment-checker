(function(){
var usernamesShowLabel = "ユーザー名を表示"
var usernamesHideLabel = "ユーザー名を非表示"

function displayChangeUsername(comment){
    var username = $(comment).find('div.content>span.byline:first');
    if(isUsernamesShown){
      username.show();
    }else{
      username.hide();
    }
}

var isUsernamesShown = true
chrome.storage.local.get("isUsernamesShown", function(value){
    valueUsernamesShown = value.isUsernamesShown;
    if(valueUsernamesShown === void 0){ // void 0 === undifined
      isUsernamesShown = true;
    }else{
      isUsernamesShown = valueUsernamesShown === "true";
    }
});

var commentObserver = {
    Start: function(){
        function commentsEvent(mutations){
            mutations.forEach(function(mutation){
                var addedNodes = mutation.addedNodes;
                for(let i=0; i<addedNodes.length; i++){
                    thickenComment(addedNodes.item(i));
                    displayChangeUsername(addedNodes.item(i))
                }
            });
        }
        function thickenComment(comment){
            var channelId = $(comment).children('a.avatar:first').attr('href');
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
            displayChangeUsername(li);
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
        $('div.live-chat-overflow-menu')
        .append(
            '<button type="button" class="yt-ui-menu-item has-icon yt-uix-menu-close-on-select chat-display-change-usernames">'
            + '<span class="yt-ui-menu-item-label">'
                + (isUsernamesShown ? usernamesHideLabel : usernamesShowLabel)
            + '</span>'
          + '</button>'
        );
        
        $(document).on('click', 'button.chat-display-change-usernames', function(){
            isUsernamesShown = !isUsernamesShown;
            
            // ボタンの表示を変更
            $('div.live-chat-overflow-menu>button.chat-display-change-usernames>span.yt-ui-menu-item-label')
            .text(isUsernamesShown ? usernamesHideLabel : usernamesShowLabel);
            
            chrome.storage.local.set(
                {"isUsernamesShown": String(isUsernamesShown)}
            );
            
            $('li.comment').each(function(i, li){
                displayChangeUsername(li);
            });
        });
        
        clearInterval(domAllCommentsWaitingId);
        commentObserver.Start();
    }
};
// コメント欄が読み込まれるまでインターバルをまわす
var domAllCommentsWaitingId = setInterval(waitDomAllComments, 500);
})();
