$(document).ready( function(){
	$('div.message-box').hide();
	var timers = [];
	var newmsg;

    function outerHTML(node){
        return node.outerHTML || new XMLSerializer().serializeToString(node);
    }

    function adjustTextareaHeight( obj ){
        $(obj).height(1);
        if( $(obj)[0].scrollHeight !== $(obj).outerHeight(true) && $(obj)[0].scrollHeight > 50 ){
            $(obj).outerHeight( $(obj)[0].scrollHeight );
        }
        else {
            $(obj).outerHeight( 50 );
        }
    }

    function addMessage(type, val){
		let message = document.createElement('div');
		message.className = 'message message-' + type;
		let timestamp = document.createElement('div');
		timestamp.className = 'timestamp';
		let now = new Date();
		let hours = now.getHours();
		let am = 'am';
		if( hours > 12 ){
			hours -= 12;
			am = 'pm';
		}
		timestamp.innerHTML = '<div class=\'currentTime\'>' + now.getFullYear() + '/' + ( '00' + ( now.getMonth() + 1 ) ).substr(-2) + '/' + ( '00' + now.getDate() ).substr(-2) + ' ' + ( '00' + hours ).substr(-2) + ':' + ( '00' + now.getMinutes() ).substr(-2) + am + '</div>';

		//now add the author to the timestamp div...
        let author = document.createElement('div');
        author.className = 'author';
        let authorDiv = document.getElementById('myAuthor');
        //let myAuthor = authorDiv.innerHTML;
        //console.log('my author: ',myAuthor);
        author.innerHTML = authorDiv.innerHTML;
        timestamp.appendChild(author);
        //now add the entire timestamp div to the message...
        message.appendChild(timestamp);

		switch(type){
			case 'text':
				let textcontent = document.createElement('div');
				textcontent.className = 'msgcontent';
				textcontent.innerHTML = val.message.replace(/\n/g, '<br>');
				message.appendChild(textcontent);
				break;
			case 'audio':
				let content = document.createElement('div');
				content.className = 'msgcontent loading';
				content.setAttribute('id', 'uuid_' + val.uuid);
				content.setAttribute('data-uuid', val.uuid);
				content.setAttribute('data-duration', val.duration);
				
				let control = document.createElement('div');
				control.className = 'audio-control loading';
				
				let playtoggle = document.createElement('button');
				playtoggle.className = 'playtoggle icon-play_arrow';
				control.appendChild(playtoggle);
				
				let duration = document.createElement('div');
				duration.className = 'duration';
				let played = document.createElement('div');
				played.className = 'duration-played';
				duration.appendChild(played);
				control.appendChild(duration);
				
				let timer = document.createElement('span');
				timer.className = 'timer';
				timer.innerHTML = 'Loading...';
				control.appendChild(timer);
				content.appendChild(control);
				message.appendChild(content);
				break;
		}
        //$('#statusbar').prepend(message); //add message to log
		newmsg = outerHTML(message);
		return newmsg;
	}
	
	function saveAudio(uuid, blob, base64){
		let url = 'data:audio/mp3;base64,' + base64;
		let message_content = $('#uuid_' + uuid);
		let duration_played = message_content.find('.duration .duration-played');
		let audio = document.createElement('audio');
		audio.setAttribute('volume', 1);
		audio.addEventListener('timeupdate', function(e){
			let percent = audio.currentTime / audio.duration * 100;
			duration_played.css({ 'width':percent + '%' });
		});
		
		let source = document.createElement('source');
		source.setAttribute('type','audio/mpeg');
		source.src = url;
		audio.appendChild(source);
		
		$(message_content).append(audio);
		timers[uuid] = message_content.find('.timer').timer();
		timers[uuid].set( $(message_content).attr('data-duration') );
		
		$(message_content).find('.loading').removeClass('loading');
        newmsg = $(message_content).parent().closest('div').prop('outerHTML');
		//console.log("Audiomsg: ", newmsg);
        $.post("./post.php", {text: newmsg}); //post the audio to post.php
		let chatbox = $('#chatbox');
        chatbox.animate({scrollTop: chatbox.get(0).scrollHeight}, 2000); //scroll to the bottom
	}

	var recorder =  $.audioRecorder({
		onaccept:function(){
			$('#submitmsg').hide();
			$('#sendvoicemsg').attr('data-accepted',1).show();
		},
		onsuccess:saveAudio,
		onerror:function(e){
			console.log('error occured', e);
		}
	});
	recorder.init();
	
	var timer = $('.message-box .timer').timer();
	$('.new-message button.audio').on('mousedown', function(){
		$(this).addClass('recording');
        $('textarea.message-box').hide();
		$('div.message-box').show();
		timer.clear();
		timer.start();
		recorder.start();
	}).on('mouseup', function(){
		$(this).removeClass('recording');
		$('div.message-box').hide();
		$('textarea.message-box').show();
		timer.stop();
		recorder.stop();
		//console.log('timer stopped', timer.duration);
		newmsg = addMessage('audio', {uuid:recorder.uuid, duration:timer.duration});
	});

	$('#submitmsg').on('click', function(){
		let newPost = $('#usermsg');
		if( newPost.val() > '' ){
			//php implementation...
			newmsg = addMessage('text', {message:newPost.val()});
            $.post("./post.php", {text: newmsg}); //post the text to post.php
			addToWordCloud(newPost.val());

			newPost.val('').outerHeight(50);
			let recordButton = $('#sendvoicemsg');
			if( recordButton.attr('data-accepted') === 1 ){
				$('#submitmsg').hide();
				recordButton.show();
			}
		}
	});
	
	$('.messages').on('click', '.audio-control button.playtoggle', function(){
		let playtoggle = $(this);
		let message = playtoggle.closest('.message');
		let content = message.find('.msgcontent');
		let uuid = content.attr('data-uuid');
		let audio = message.find('audio').get(0);
		let timer = message.find('.timer');
		let duration_played = content.find('.duration .duration-played');
		let $timer = timers[uuid];
        console.log('debug timer ', timer);
        console.log('debug timers ', timers);
		console.log('debug $timer ', $timer);
		
		if( !audio || !audio.play ){
			return;
		}
		
		if( playtoggle.hasClass('icon-play_arrow') ){
			if( !playtoggle.hasClass('started') ){
				$timer.set(0);
				duration_played.width(0);
			}
			$timer.start();
			audio.play();
			playtoggle.removeClass('icon-play_arrow').addClass('icon-pause').addClass('started');
		} else {
			audio.pause();
			$timer.pause();
			playtoggle.addClass('icon-play_arrow').removeClass('icon-pause');
		}
		
		audio.addEventListener('ended', function(){
			playtoggle.addClass('icon-play_arrow').removeClass('icon-pause').removeClass('started');
			$timer.stop();
			$timer.set( content.attr('data-duration' ) );
			duration_played.css({ 'width':'100%' });
		});
		
	});
	
	$('#usermsg').on('keyup', function(e){
		adjustTextareaHeight( $(this) );
		let sendButton = $('#submitmsg');
		let recordVoiceButton = $('#sendvoicemsg');
		if( $(this).val() > '' && sendButton.is(':hidden') ){
			sendButton.show();
			recordVoiceButton.hide();
		} else if( $(this).val() === '' && recordVoiceButton.is(':hidden') && recordVoiceButton.attr('data-accepted') === 1 ){
			sendButton.hide();
			recordVoiceButton.show();
		}
	}).on('keydown', function(e){
		adjustTextareaHeight( $(this) );
	});

	function addToWordCloud(msg) {
		//console.log('message as per wordcloud: ', msg);
		bits = msg.split(/[\s,]+/);
		var arrayLength = bits.length;
		for (var i = 0; i < arrayLength; i++) {
			//console.log(bits[i]);
			$.post("./post2wordcloud.php", {text: bits[i]}); //post the text to post2wordcloud.php --> database
		}
	}

});