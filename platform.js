$.dispatchPlatform = {
    id: 'Platform Dispatch',
    version: '2.0',
    defaults: {
		$platform:	"DC", 						//	Options are for now "DC" -> DoubleClick & "SK" -> Sizmek
		$isRich: true,							//	If this is set to false, the plugin will bypass functionality setup of a rich media unit
		$loadPolitely: true,					//	Whether or not the unit takes the extra step of using a polite loader *NA if not a RM Unit*
		
		$expandable: true,						//	Whether or not the Unit Expands - If this is set to false, the "$collapsed" parameter will be the units dimensions
		$expandDirection: "down",				//	If "$expandable" parameter is set to true, direction in which the unit expands ["Up", "Down", "Left", "Right"]
		$collapsedSize:	[970, 90],				//	Size ([Width, Height]) of the collapsed state of the unit *NA if not a RM Unit*
		$expandedSize:	[970, 550],				//	Size ([Width, Height]) of the expanded state of the unit *NA if not a RM Unit*
		
		$collapseImageOrText: "Collapse",		// If Rich Media Unit, Url of Image or Text contained in Button.  If Blank, will be an invisible div with copy "Collapse" located based on values in "$collapsedBtnSize"
		$expandImageOrText: "Expand",			// If Rich Media Unit, Url of Image or Text contained in Button.  If Blank, will be an invisible div with copy "Expand" located based on values in "$expandedBtnSize"
		$collapseBtnSizePos: [0, 0, 0, 0],		// Array of [Width, Height, X, Y] of Collapse Button if 0, will be set to default size of [200 - width, 30 - height, lower right corner of expand panel]
		$expandBtnSizePos: [0, 0, 0, 0],		// Array of [Width, Height, X, Y] of Expand Button if 0, will be set to default size of [200 - width, 30 - height, lower right corner of collapse panel]
		
		$hasVideo: true,						//	Does this unit contain a video								
		$isYoutubeVid: [true, false],			//	Whether or not the Unit Uses the Youtube API to display video, and if the youtube player uses the standard youtube close button
		$youtubeTracking: true,					//	Unit Consists of Youtube Video and is using Yoube Tracking (
		$videoContainer: "",					//	The ID of the div that will be containing the video
		$youtubeVidID: "vLlEBB-HlN8",			//	The Youtube Id of the video to be loaded
		$showVidOnStart: false,					//	Determines if the video container is visible from the beginning of the unit animation / visibility.
		$videoUrl: "",							//	If the video contained is not of Youtube, must supply Url of video (Bypassed if "$hasYoutube" is set to true)
		$videoPosSize: [878, 496, 40, 25],		//	The Dimensions of the Video and it's parent Container, as well as the position of the Container [Width, Height, X, Y].
		$vidQuality: "medium",					//	If the video contained is not of Youtube, must supply Url of video (Bypassed if "$hasYoutube" is set to false)
		$videoVars: {							//	These are the options supplied to the Youtube Player API (https://support.google.com/richmedia/answer/6098219?hl=en&ref_topic=6098218)
			'autoplay': 0, 							//	With autoplay enabled, the video won't get video views.
			'rel': 0,								//	Show Relative Videos.
			'showinfo': 0,							//	Show The Video's Information.
  		}
	}
};

(function ($) 
{
	"use strict";
	
	var _platform;
	var adDiv;
	
	var _isRich;
	var _loadPolitely;
	var _expandable;
	var _expandDirection;
	var _collapsedSize;
	var _expandedSize;
	
	var collapsed_panel;
	var btnExpandCTA_dc;
	
	var expanded_panel;
	var btnCloseCTA_dc;
	
	var _collapseImageOrText;
	var _expandImageOrText;
	var _collapseBtnSizePos;
	var _expandBtnSizePos;
	
	var _hasVideo;
	var _isYoutubeVid;
	var _usesYoutubeClose;
	var _youtubeTracking;
	var _vidContainer;
	var _youtubeVidID;
	var _showVidOnStart;
	var _videoUrl;
	var _videoPosSize;
	var _vidQuality;
	var _videoVars;
	
	var _ytp;
	var _firstPlay;  
	var _videoReady;
	var _txtImage;

	var _isExpanded;
	
	var _player;
	
    $.fn.extend({
        dispatchPlatform: function (params) 
		{
            return this.each(function () 
			{
                var opts = $.extend({}, this.defaults, params);
			
				_platform = opts.$platform;
				_isRich = opts.$isRich;
				_loadPolitely = opts.$loadPolitely;
				_expandable = opts.$expandable;
				_expandDirection = opts.$expandDirection;
				_collapsedSize = opts.$collapsedSize;
				_expandedSize = opts.$expandedSize;
				
				_collapseImageOrText = opts.$collapseImageOrText;
				_expandImageOrText = opts.$expandImageOrText;
				_collapseBtnSizePos = opts.$collapseBtnSizePos;
				_expandBtnSizePos = opts.$expandBtnSizePos;
				
				_hasVideo = opts.$hasVideo;
				_isYoutubeVid = opts.$isYoutubeVid[0];
				_usesYoutubeClose = opts.$isYoutubeVid[1];
				_youtubeTracking = opts.$youtubeTracking;
				_vidContainer = opts.$videoContainer;
				_youtubeVidID = opts.$youtubeVidID;
				_showVidOnStart = opts.$showVidOnStart;
				_videoUrl = opts.$videoUrl;
				_videoPosSize = opts.$videoPosSize;
				_vidQuality = opts.$vidQuality;
				_videoVars = opts.$videoVars;	
				
				var $bg_exit = $("<div id='bg-col-exit'></div>");
				var $bg_expanded_exit = $("<div id='bg-exp-exit'></div>");	
				
				switch (_platform)
				{
					//	Remove the Unecessary Script Tags
					case "DC" :    					
						$(".skjs").remove();
						
						break;
						
					case "SK" :
						$(".dcjs").remove();
						
						break;
				}
				//console.log(_platform);
				window.addEventListener("load", init_platform);
			});
        }
    });
	
	/*	Process Functions	*/
	
	function init_platform()
	{		
		switch (_platform)
		{
			//	Trigger the Specified Script Determined by each of the 3rd Party Servers (Although Quite Identical)
			case "DC" :
				if (!Enabler.isInitialized()) 
				{
					Enabler.addEventListener(studio.events.StudioEvent.INIT, init_handle);
				} else {
					init_handle();
				}
				break;
				
			case "SK" :
				if (!EB.isInitialized()) 
				{
					EB.addEventListener(EBG.EventName.EB_INITIALIZED, init_handle);
				} else {
					init_handle();
				}
				break;
		}
	}
	
	function init_handle()
	{		
		if (!_isRich)
		{
			adDiv = $("#ad");
			addEventListeners();
			init_animation();
		} else {
			adDiv = $("#main-panel");
			_isExpanded = false;
			
			//	If This is a Rich Media Unit, Determine From the Options if it has video, If No Video, Begin Setup of Rich Media Unit
			if (_hasVideo)
			{
				init_video();
			} 
			init_expandable();
		}
	}
	
	function init_video()
	{
		if (!_showVidOnStart)
		{
			_vidContainer.css({
				"width" : _videoPosSize[0] + "px",
				"height" : _videoPosSize[1] + "px",
				"display" : "none",
				"opacity" : "0", 
				"transform" : "translate(" + _videoPosSize[2] + "px," + _videoPosSize[3] + "px)"
			});
		} else {
			_vidContainer.css({
				"width" : _videoPosSize[0] + "px",
				"height" : _videoPosSize[1] + "px",
				"transform" : "translate(" + _videoPosSize[2] + "px," + _videoPosSize[3] + "px)"
			});
		}
		if (_isYoutubeVid)
		{
			init_yt_video();
		} else {
			init_rg_video();
		}
	}
	
	/*	Called Functions	*/
	
	// YouTube Player Properties Configuration. ----->
	function init_yt_video()
	{
		if (_youtubeTracking)
		{
			_firstPlay = true;  
			_videoReady = false;
			
			_player = 
			{
			  "containerId": _vidContainer, 
			  "videoId": _youtubeVidID,
			  "videoWidth": _videoSize[0],
			  "videoHeight": _videoSize[1],
			  "suggestedQuality": _vidQuality,
			  "playerVars": _videoVars
			};
			
			switch (_platform)
			{
				case "DC" :
					Enabler.loadScript(Enabler.getUrl("https://www.gstatic.com/doubleclick/studio/innovation/h5/ytplayer/ytp_v2.js"), yt_construct);
					
					if (_usesYoutubeClose)
					{
						Enabler.loadScript(Enabler.getUrl("https://www.gstatic.com/external_hosted/polymer/custom.elements.min.js"), function() {});
						Enabler.loadScript(Enabler.getUrl("https://www.gstatic.com/ads/ci/ytclosebutton/1/ytclosebutton_min.js"), function() {});
					}
					break;
					
				case "SK" :
					
					
					break;	
			}
		} else {
			_player = $('<iframe width="' + _videoSize[0] + '" height="' + _videoSize[1] + '" src="https://www.youtube.com/embed/' + _youtubeVidID + '?autoplay=0&rel=0&wmode=opaque" frameborder="0" wmode="opaque" allowfullscreen></iframe>');
			_vidContainer.append(_player);
		}
	}
	
	function yt_construct()
	{
		if (_youtubeTracking)
		{
			// Construct the YouTube player variable.
			_ytp = new studioinnovation.YTPlayer(_player);
		
			// Bind event listeners.
			bindListeners();
		} else {
			
		}
	}

	function yt_playing()
	{
		if(_firstPlay)
		{
			Enabler.counter('YTVideo Play');
		} else {
			Enabler.counter('YTVideo Replay');
			_firstPlay = true;
			if(_ytp.isMuted)
			{
				_ytp.unMute();
			}
		} 
	}

	// YT Player State
	function handleVideoStateChange(stateChangeEvent)
	{
		var _playerState = stateChangeEvent.getPlayerState();
	
		switch (_playerState)
		{ 
			case studioinnovation.YTPlayer.Events.PLAYING:
				yt_playing();          
				break;
		
			case studioinnovation.YTPlayer.Events.PAUSED:
				Enabler.counter('YTVideo Pause');
				Enabler.stopTimer('YTVideo Timer');
				break;
		
			case  studioinnovation.YTPlayer.Events.TIMER_START:
				Enabler.startTimer('YTVideo Timer');
				break;
		
			case  studioinnovation.YTPlayer.Events.TIMER_STOP:
				Enabler.stopTimer('YTVideo Timer');
				break;
		
			case studioinnovation.YTPlayer.Events.ENDED:
				Enabler.stopTimer('YTVideo Timer');
				_firstPlay = false;
				break;
		}
	}

	function bindListeners()
	{
		_ytp.addEventListener('statechange', handleVideoStateChange, false);
	
		// YouTube playback quartiles.
		_ytp.addEventListener(studioinnovation.YTPlayer.Events.VIDEO_0_PERCENT, function()
		{
			Enabler.counter('YTVideo Percent 0');
		}, false);
		_ytp.addEventListener(studioinnovation.YTPlayer.Events.VIDEO_25_PERCENT, function() {
			Enabler.counter('YTVideo Percent 25');
		}, false);
		_ytp.addEventListener(studioinnovation.YTPlayer.Events.VIDEO_50_PERCENT, function() {
			Enabler.counter('YTVideo Percent 50');
		}, false);
		_ytp.addEventListener(studioinnovation.YTPlayer.Events.VIDEO_75_PERCENT, function() {
			Enabler.counter('YTVideo Percent 75');
		}, false);
		_ytp.addEventListener(studioinnovation.YTPlayer.Events.VIDEO_100_PERCENT, function() {
			Enabler.counter('YTVideo Percent 100');
		}, false);
	}
	
	
	
	
	
	// Regular Web Player Properties Configuration. ----->
	function init_rg_video()
	{
		
	}
	
	
	
	
	
	function init_expandable()
	{
	
	/*Offset of left,top and width height, respectively, of the expanded Masthead.
	  The expansion of a Masthead is only from 970x250 -> 970x500, so this configuration will not change*/
		Enabler.setExpandingPixelOffsets(0, 0, _expandedSize[0], _expandedSize[1]);
	
		init_ctas();
	}
	
	function init_ctas()
	{
		//Create Elements
		var $btns = [[btnCloseCTA_dc,"ctaClose_dc"], [btnExpandCTA_dc,"ctaExpand_dc"]];
		
		$.each([_collapseImageOrText, _expandImageOrText], function($idx, $str)
		{
			if ($str.indexOf(".jpg") !== -1 || $str.indexOf(".jpeg") !== -1 || $str.indexOf(".png") !== -1)
			{
				$btns[$idx][0] = $("<div data-cta-type='image' id='" + $btns[$idx][1] + "'><img src=" + $str + "></div>");
			} else if ($str !== "") 
			{
				$btns[$idx][0] = $("<div data-cta-type='text' id='" + $btns[$idx][1] + "'>" + $str + "</div>");
			} else {
				$btns[$idx][0] = $("<div data-cta-type='text' id='" + $btns[$idx][1] + "'>Click To Expand</div>");
				$btns[$idx][0].css({"opacity":"0"});
			}
		});
		
		//Assign Variables
		collapsed_panel = $("#collapsed-panel");
		collapsed_panel.prepend(btnExpandCTA_dc);
	
		expanded_panel = $("#expanded-panel");
		expanded_panel.prepend(btnCloseCTA_dc);
		
		btnCloseCTA_dc.css({
			"width" : "px",
			"height" : "px",
			"left" : "px",
			"right" : "px"
		});
		if (get_cta_type(btnCloseCTA_dc))
		{
			btnCloseCTA_dc.find("img").css({
				"width":"",
				"height":""				
			});
		}
		
		
		btnExpandCTA_dc.css({
			"width" : "px",
			"height" : "px",
			"left" : "px",
			"right" : "px"
		});
		if (get_cta_type(btnExpandCTA_dc))
		{
			btnExpandCTA_dc.find("img").css({
				"width":"",
				"height":""				
			});
		}
		
		function get_cta_type($elm)
		{
			var $img;
			if ($elm.attr("data-cta-type") === "image")
			{
				$img = true;	
			} else {
				$img = false;
			}
			return $img; 
		}
		
	
		//Adding listeners
		addListeners();
	}
	
	//	Clickthrough Setup / Functionality
	function clickThrough()
	{
		switch (_platform)
		{
			case "DC" :
				Enabler.exit("clicktag");
				window.open(window.clickTag);
				
				break;
				
			case "SK" :
				EB.clickthrough();
				
				break;
		}
	}
	
	function addEventListeners()
	{
		document.getElementById("holder").addEventListener("click", function()
		{
			clickThrough();
		});
	}
})(jQuery);