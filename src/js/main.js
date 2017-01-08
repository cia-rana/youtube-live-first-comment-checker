(function(){
var usernamesShowLabel = "ユーザー名を表示";
var usernamesHideLabel = "ユーザー名を非表示";
var usernamesWidth = 100;
chrome.storage.local.get('usernamesWidth', (value) => {
  valueUsernamesWidth = value.usernamesWidth;
  if(valueUsernamesWidth !== void 0){
    usernamesWidth = parseInt(valueUsernamesWidth);
  }
});

function putOutUsername(comment){
  $(comment).find('div#content>span#author-name:first')
  .resizable({
    handles: 'e',
    resize: (event, ui) => {
      usernamesWidth = ui.size.width;
      $('yt-live-chat-text-message-renderer').each((i, li) => {
        resizeUsernameWidth(li, usernamesWidth);
      });
    },
    stop: (event, ui) => {
      usernamesWidth = ui.size.width;
      chrome.storage.local.set(
        {'usernamesWidth': String(usernamesWidth)}
      );
    },
  })
  .css('width', '100px')
  .css('white-space', 'nowrap')
  .css('overflow', 'hidden')
  .css('text-overflow', 'ellipsis')
  .css('align-self', 'center')
  .insertBefore($(comment).find('div#content'));
  
  $(comment).find('div#content')
  .css('width', '100%');
}

function resizeUsernameWidth(comment, width){
  $(comment).find('span#author-name:first')
  .css('width', width + 'px');
}

var commentObserver = (function() {
  function commentsEvent(mutations){
    for(let mutation of mutations) {
      for(let node of mutation.addedNodes) {
        thickenComment(node);
        putOutUsername(node);
        resizeUsernameWidth(node, usernamesWidth);
      }
    }
  }
  function thickenComment(comment){
    var channelId = $(comment).attr('data-author-id');
    if(!channelIdSet.has(channelId)){
      channelIdSet.add(channelId);
      $(comment).find('div.comment-text:first')
      .addClass('first-comment-user-text');
      $(comment).find('a.yt-user-name:first')
      .addClass('first-comment-user-name');
    }
  }
  
  var channelIdSet = new Set();
  var mo = new MutationObserver(commentsEvent);
  
  return {
    Start: (domAllComments) => {
      mo.observe(domAllComments[0], {
        attributeFilter: ['yt-live-chat-text-message-renderer'],
        childList: true
      });
      
      // Observer開始時に一度全コメントを走査する
      $(domAllComments[0]).find('yt-live-chat-text-message-renderer').each((i, li) => {
        thickenComment(li);
        putOutUsername(li);
        resizeUsernameWidth(li, usernamesWidth);
      });
    },
    Stop: () => {
      mo.disconnect();
    }
  }
})();

// コメント欄が読み込まれるまでインターバルをまわす
var domAllCommentsWaitingId = setInterval(() => {
  var domAllComments = $('div#items.style-scope.yt-live-chat-item-list-renderer');
  
  // コメント欄が読み込まれた場合
  if(domAllComments.length > 0){
    $(document).ajaxComplete(function() {
      console.log("hello");
    });
    clearInterval(domAllCommentsWaitingId);
    commentObserver.Start(domAllComments);
  }
}, 500);

})();
