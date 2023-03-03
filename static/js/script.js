/* Author:
 Andre Massow britnex@gmail.com
*/

var structures = {};


function scrollup()
{
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  
	  if (file.isactive)
	  {
		  file.lastscrolltop = -1;
		  
		  file.position[0]-= 0x100;
		  file.position[1]-= 0x100;
		  if (file.position[0]<0)
			  file.position[0]=0;
		  if (file.position[1]<17*23)
			  file.position[1]=17*23;
		  
		  		  
	      file.readBlob( file.position[0], file.position[1] );
	
	      var top = Math.floor((10000 - file.div.find(".hexscroll").height() )*file.position[0] / file.file.size);
	      file.div.find(".hexscroll").scrollTop( file.lastscrolltop = top );
	
		  break;
	  }
	}
}

function scrolldown()
{
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  
	  if (file.isactive)
	  {
		  file.lastscrolltop = -1;
		  
		  file.position[0]+= 0x100;
		  file.position[1]+= 0x100;
		  		  
	      file.readBlob( file.position[0], file.position[1] );
	      
	      var top = Math.floor((10000 - file.div.find(".hexscroll").height() )*file.position[0] / file.file.size);
	      file.div.find(".hexscroll").scrollTop( file.lastscrolltop = top );
	
		  break;
	  }
	}
}

function dataToString( data, offset, type, size)
{
	
	var endian = "big";
	
	var bytedata = "";
	
	if (size>16)
		size = 16;
	 
	for (var i=0;i<size;i++) {
		
		
		var c = (data[offset+i]).toString(16);
		if (c.length==1)
			c = "0"+c;
		bytedata += c;
	}
	
	  var endianbytedata = bytedata;
	  
	  if (endian=="little"){
		var tmp = "";
		for (var i=0;i<size;i++)
		{
			tmp = bytedata.substring( i*2 , i*2+2 )+tmp;
		}
		endianbytedata = tmp;
	}	
	
	switch (type){
	
		case "string":
			var tmp = "";
			for (var i=0;i<size;i++)
			{
				var ch = parseInt( bytedata.substring( i*2 , i*2+2 ), 16 );
				if (ch!=0){
					if (ch<32) ch = ".";
					if (ch>127) ch = ".";
					tmp += String.fromCharCode(ch);
				}
			}
			return tmp;
		break;
	
	  	case "int8":
	  	case "int16":
	  	case "int32":
	  	case "int64":		
	  		var val = parseInt( endianbytedata.substring(0, size*2) , 16);
  		
  			if (parseInt(endianbytedata.substring(0,1),16)&0x8)
  				val = -(Math.pow(2, 8*size)-val);
  		
  			return val;							  		
  		break;  		
  		
  		case "uint8":
  		case "uint16":
  		case "uint32":
  		case "uint64":		
  			return parseInt( endianbytedata.substring(0, size*2) , 16);
  		break;
		
		case "hex":
			var tmp = "";
			for (var i=0;i<size;i++)
			{
				var x = bytedata.substring( i*2 , i*2+2 );
				tmp+="0x"+x+((i<size-1)?" ":"");
			}
			return tmp;
		break;
		
	
	}
	
	return "error";
}

function selectStructure(id){
	
	var table = $("#structuretable");
	
	var tbody = table.find("tbody");
	if (tbody.length>0)
		tbody.empty();
	
	var loaded = function()
	{
		var structure = structures[id];
		
		structure.structure = null;
		
		updateStructure(structure);
		
	};
	
	if (structures[id])
		loaded();
	else
		$.getScript("/structures/"+id+".js", loaded );
}

function updateStructure(structure)
{
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  
	  if (file.isactive)
	  {
		  
		  var r = new FileReader();
		    
		    r.onloadend = function(evt) {
		      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
		    	  var bytes = new Uint8Array( evt.target.result );
		    	  
		    	  var table = $("#structuretable");
		    	  if (structure.structure==null) {
			    	  structure.init( bytes );
			    	  
			    	  for (var i=0;i<structure.structure.length;i++){
			    		var s = structure.structure[i];		
			    		
			    		var tr = $("<tr class=\"auto\" />");
			    		if (typeof s === "string"){

			    			$("<td colspan=\"5\" class=\"caption\"><span class=\"glyphicon glyphicon-tags\"></span>&#160; "+s+"</td>").appendTo(tr);
			    			
			    		} else {
			    		
				    		$("<td class=\"offset\">"+s.offset+"</td>").appendTo(tr);
				    		$("<td class=\"size\">"+s.size+"</td>").appendTo(tr);
				    		$("<td class=\"type\">"+s.type+"</td>").appendTo(tr);
				    		$("<td class=\"name\">"+s.name+"</td>").appendTo(tr);
				    		$("<td class=\"data\">"+s.data+"--</td>").appendTo(tr);
			    		
			    		}
			    		tr.appendTo(table);			    		
			    		s.tr = tr;
			    		
			    		tr.click(function(){
			    			var tr = $(this);
			    			
			    			var td_offset = tr.find("td.offset");
			    			if (td_offset.length>0) {
				    			var td_size = tr.find("td.size");
				    			var start = parseInt( td_offset.text() ); 
				    			var end = start + parseInt( td_size.text() )-1;
				    			
				    			for (var i=0;i<files.length;i++)
				    			{
				    			  var file = files[i];
				    			  
				    			  if (file.isactive)
				    			  {
				    				  file.selection = [ start, end ];		  
				    			      file.readBlob( file.position[0], file.position[1] );
				    			      file.lastscrolltop = top;
				    			      break;
				    			  }
				    			}
			    			}
			    		});
			    		
			    	  }
		    	  }
		    		
		    	  for (var i=0;i<structure.structure.length;i++){
		    	  		var s = structure.structure[i];
		    	  		
		    	  		if (typeof s === "string")
		    	  			continue;
		    	  				    	  		
		    	  		var tr = s.tr;
		    	  				   
		    	  		var format = s.format;		    	  		
		    	  		s.value = dataToString( bytes, s.offset, s.type, s.size );
		    	  		
		    	  		var td_data = tr.find("td.data");
		    	  		structure.check( bytes );
		    	  		td_data.html("<b>"+format.replace("%s", s.value )+"</b>");
		    		}
		    	  
		    	  
		      }
		    };
		    
		  
		    var blob = null;
		    
		    if (file.file.slice) {
		  	      blob = file.file.slice( structure.data.offset , structure.data.offset+structure.data.size );
		  	    } else
		  if (file.file.webkitSlice) {
	  	      blob = file.file.webkitSlice( structure.data.offset , structure.data.offset+structure.data.size );
	  	    } else if (file.file.mozSlice) {
	  	      blob = file.file.mozSlice( structure.data.offset , structure.data.offset+structure.data.size  );
	  	    }
		    
		    if (blob!=null)
	  	    r.readAsArrayBuffer(blob);
	  	    
	  	    
	
		  break;
	  }
	}
	
	
	
}


function HexFile()
{
	
}


HexFile.prototype.div = null;
HexFile.prototype.file = null;
HexFile.prototype.loading = false;
HexFile.prototype.loaded = false;
HexFile.prototype.i = -1;
HexFile.prototype.isactive = true;

HexFile.prototype.selection = [ 0, 1 ];
HexFile.prototype.position = [ 0, 0 ];
HexFile.prototype.selectedinput = null;


HexFile.prototype.lines = 24;

HexFile.prototype.changes = {};
  
HexFile.prototype.readBlob= function (opt_startByte, opt_stopByte) {
	
	  if (this.loading)
		return;
	  
	  
	  if (opt_startByte>(this.file.size-16*this.lines+5*16))
	  {
		  var diff = opt_startByte - (this.file.size-16*this.lines+5*16);
		  
		  opt_startByte-=diff;
		  opt_stopByte -=diff;
	  
	  }
		   
	  
	  this.position = [ opt_startByte, opt_stopByte ];
	    
	  
	  
	  this.div.find(".hexdump").css({color:"#111111"});
	  
	  this.loading = true;
	  var _this = this;
	    
	    var start = parseInt(opt_startByte) || 0;
	    var stop = parseInt(opt_stopByte) || this.file.size - 1;

	    var reader = new FileReader();

	    
	    reader.onloadend = function(evt) {
	      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
	    	  
	    	if (!_this.loaded)
	    	{
	    	 // _this.div.find(".hexscroll div").css( {height:( ( 20*(2+ _this.file.size/16 ) )+ "px")} );
	    	 // _this.div.find(".hexscroll").scrollTop( 0 );
	    		
	    	//	_this.div.find(".hexscroll").find("div").slider( { /* start:function(){ var pos = _this.div.find(".hexscale").find("span"); pos.show(); pos.text( $(this).slider( "option", "value") ); }, slide:function(){ _this.div.find(".hexscale").find("span").text( 16+_this.file.size-$(this).slider( "option", "value") ); }, stop:function(){_this.div.find(".hexscale").find("span").hide(); } */ slide:scroll, /*change:scroll,*/ value:(_this.file.size-1) , min:0, max:(_this.file.size-1), orientation: "vertical" } );
    			    		
	    		/*
	    		_this.div.find(".hexscroll").find("span").each(function(){
		    		if($.browser.mozilla){
		                $(this).css('MozUserSelect','none');
		            }else if($.browser.msie){
		                $(this).bind('selectstart',function(){return false;});
		            }else{
		                $(this).mousedown(function(){return false;});
		            }
	    		} );
	    		*/
	    		
	    		_this.div.find(".hexoffset").find("input").keypress(function(e){
	   	    	 if (e.which==13)
	       		 {
	   	    		 var top = Math.floor((10000 - _this.div.find(".hexscroll").height() )*parseInt( $(this).val() , 16) / _this.file.size);
	   	    		 	   	    		 
	   	    		_this.div.find(".hexscroll").scrollTop( _this.lastscrolltop = top );
	   	    		//_this.div.find(".hexscroll").find("div").slider( "option", "value", _this.file.size- parseInt( $(this).val() , 16) );
	   	    		
	   	    		 var start = 16*Math.floor( parseInt( $(this).val() , 16)/16.0 );
	   	    		
	   	    		_this.readBlob( start , start+ 16* _this.lines -1 );
	   	    		 e.preventDefault();
	       		 }
	   	      	});
	    		
	    		_this.div.find(".hexscroll").scrollTop( _this.lastscrolltop = 0 );
	   	      	

	    		
	    		
	          _this.loaded = true;
	    	}

	    	  var bytes = new Uint8Array( evt.target.result );
	      	    	
	    	
	    	var hexdump = "";
	    	var hextext = "";
	    	var hexoffset = "";
	    	
	    	var size = _this.file.size;
	    	
	    	var offset = 0;
	    	
	    	if (_this.selection[0] < (offset+opt_startByte))
	    	if (_this.selection[1] >= (offset+opt_startByte))
   		  	{
   		    	hexdump += "<b class=\"selected\">";
   		    	hextext += "<b class=\"selected\">";
   		  	}	  
	    	
	        
	    	for (var j=0;j<bytes.length/16 && offset<size;j++)
	    	{
	    		
	    		var offsetline = (offset+opt_startByte).toString(16);
	        	while (offsetline.length<10)
	        		offsetline="0"+offsetline;
	    		
	    		var row = "";
	    		var text = "";
	    		
	    		var rowchanges = _this.changes[ ""+(opt_startByte+offset) ]; 
	        		    		
	        	for (var i=0;i<16 && offset<size;i++)
	        	{
	        	  var modified = false;
	        		
	        	  var ch = null;
	        	  if (rowchanges !== undefined) {
		        	ch = rowchanges[i];
		        	if (ch!=null)
		        		modified = true;
			      } 
	        	  
	        	  if (ch==null)
			    	  ch = bytes[offset];
	        	  
	        	  if (ch==null)
	        		  break;
	        	  if (ch===undefined)
	        		  break;
	        	  
	        	  
/*	        	  
	        	  var tmp = _this.changes[ ""+(opt_startByte+offset) ]; 
	        	  if (tmp !== undefined)
	        		  ch = tmp;
*/	        	  	        	  
	        	  
	        	  var h = ch.toString(16);
	        	  var g = "";
	        	  
	        	  if (ch==60)
	        		  g="&#60;";
	        	  else
        		  if (ch==62)
        			  g="&#62;";
	        	  else
	        	  if (ch>=32 && ch<=127)
	        		  g= String.fromCharCode( ch );
	        	  else
	        		  g= ".";	        	  
	        	  
	        	  while (h.length<2) h="0"+h;
	        	  
	        	  if ((offset+opt_startByte)== _this.selection[0])
        		  {
        		    hexdump += "<b class=\"selected\">";
        		    hextext += "<b class=\"selected\">";
        		  }	        		
	        	  
	        	  if (modified) {
	        		  hexdump += "<u>"+h+"</u>";	        	  
	        		  hextext += "<u>"+g+"</u>";
	        	  } else 
	        	  {
	        		hexdump += h;	        	  
		        	hextext += g;
	        	  }
	        	  
	        	  if ((offset+opt_startByte)== _this.selection[1])
        		  {
        		    hexdump += "</b>";
        		    hextext += "</b>";
        		  }
	        	  
	        	  hexdump += (i<16?" ":"");
	        	  
	        	  offset++;	        	
	        	}
	        	hexdump+="<br />\n";
	        	hextext+="<br />\n";
	        	
	        	if (j>0)
	        	hexoffset+="<span title=\""+("0x"+offsetline+" = "+(offset+opt_startByte))+"\">"+offsetline+"</span>"+"<br />";
	      	}	 
	    	
	    	
	    	if (_this.selection[1] > (offset+opt_startByte))
   		  	{
   		    	hexdump += "</b>";
   		    	hextext += "</b>";
   		  	}
	    	
	    	_this.div.find(".hexdump").html( hexdump );
	    	_this.div.find(".hextext").html( hextext );
	    	
	    	
	    	{
		    	var offsetline = (opt_startByte).toString(16);
	        	while (offsetline.length<10)
	        		offsetline="0"+offsetline;
		    	var inp = _this.div.find(".hexoffset").find("input");
		    	inp.val( offsetline );
		    	
		    	inp.attr("title", "0x"+offsetline+" = "+opt_startByte  );
		    	inp.attr("alt", offsetline );
	    	}
	    	
	    	_this.div.find(".hexoffset").find("div").html( hexoffset );
	    	_this.div.find(".hexdump").css({color:"black"});
	    	
	    	{
	    		var off = _this.selection[0];
	    		if (off<0) off=0;
	    		$("#offset").text( "0x"+(off).toString(16)+"="+off);
	    	}
	    	
	    	if (_this.selection[0]>-1 && _this.selection[1]>-1)
	    	{
		    	var tmp = _this.selection[0].toString(16);
		    	//while (tmp.length<8) tmp="0"+tmp;
		    	$( ".hexselection input.start").val( "0x"+ tmp );
		    	tmp = _this.selection[1].toString(16);
		    	//while (tmp.length<8) tmp="0"+tmp;
		    	$(".hexselection input.end").val( "0x"+tmp );
		    	
		    	
			    	var r = new FileReader();
			  	    r.onloadend = function(evt) {
			  	      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
			  	    	  
			  	    	var bytes = new Uint8Array( evt.target.result );
			  	    	
			  	    	var hexdata = "";
			  	    	var hexdatarows = 0;
			  	    	
			  	    	var bytedata = "";
			  	    	
			  	    	var size = _this.selection[1]-_this.selection[0]+1;
			  	    	
			  	    	for (var i=0;i<bytes.length;i++)
			  	    	{
			  	    		var ch1 = null;
			  	    					  	    		
			  	    		/*
			  	    		var tmp = _this.changes[ ""+(_this.selection[0]+i) ]; 
				        	  if (tmp !== undefined)
				        		  ch1 = tmp;
				        		  */			  	    		

					  		var rowchangeindex = ""+((_this.selection[0]+i) - (_this.selection[0]+i)%16);
					  		var rowchangeoffset =  (_this.selection[0]+i)%16;
					  		
					  		
						  	if (_this.changes[ rowchangeindex ] !== undefined)
						  		ch1 = _this.changes[ rowchangeindex ][ rowchangeoffset ];						  		
						  	
						  	if (ch1==null)
						  		ch1 = bytes[i];
			  	    		
			  	    		var c = ch1.toString(16);
			  	    		while (c.length<2) c = "0"+c;
			  	    		bytedata += c;	
			  	    		
			  	    		if (i<size){
				  	    		hexdata+="0x"+c;
				  	    		if (i%16==15) {
				  	    			hexdata+="\n";
				  	    			hexdatarows++;
				  	    		}
				  	    		else
				  	    			if (i<bytes.length-1)
				  	    				hexdata+=" ";
			  	    		}
			  	    	}
			  	    	
			  	    	if (hexdatarows==0)
			  	    		hexdatarows = 1;
			  	    	  
			  	    	
			  	    	var endian = $("#endian").val();
			  	    	
			  	    	
			  	    	
			  	    	$("#hexvalues").find("input.val").each(function(){
			  	    		var input = $(this);
			  	    		
			  	    		 var type = input.attr("id");
			  	    		 
			  	    		 
			  	    		  var size = 8;
							  while (size <= 64){
								  if (input.hasClass("size"+size))
									  break;
								  size*=2;
							  }
							  size /=8;
							  
							  
							  var endianbytedata = bytedata;
							  
							  if (endian=="little"){
					  	    		var tmp = "";
					  	    		for (var i=0;i<size;i++)
					  	    		{
					  	    			tmp = bytedata.substring( i*2 , i*2+2 )+tmp;
					  	    		}
					  	    		endianbytedata = tmp;
					  	    	}
							  
							  
							 
							  switch(type){
							  	case "hex8":
							  		input.val( "0x"+ parseInt( endianbytedata.substring(0, 2) , 16).toString(16) );
							  		break;
							  	case "int8":
							  	case "int16":
							  	case "int32":
							  	case "int64":		
							  		var val = parseInt( endianbytedata.substring(0, size*2) , 16);
							  		
							  		if (parseInt(endianbytedata.substring(0,1),16)&0x8)
							  			val = -(Math.pow(2, 8*size)-val);
							  		
							  		input.val( val );							  		
							  		break;
							     
							  	case "uint8":
							  	case "uint16":
							  	case "uint32":
							  	case "uint64":		
							  		var val = parseInt( endianbytedata.substring(0, size*2) , 16);
							  		//val = (val >>> 1) * 2 + (val&1);							  		
							  		input.val( val );
							  		break;
							  		
							  }
			  	    		
			  	    	});
			  	    	
			  	    	
			  	    	
			  	      var tr = $("<tr />");
	    			  $("<td class=\"nr\">1</td>").appendTo(tr);
	    			  $("<td class=\"start\">"+_this.selection[0]+"</td>").appendTo(tr);
	    			  $("<td class=\"end\">"+_this.selection[1]+"</td>").appendTo(tr);
	    			  $("<td class=\"size\">"+(bytes.length)+"</td>").appendTo(tr);
	    			  $("<td class=\"type\"><select><option>hex</option></select></td>").appendTo(tr);
	    			  $("<td class=\"data\"><textarea rows=\""+hexdatarows+"\">"+hexdata+"</textarea></td>").appendTo(tr);
	    			  
	    			  $('#hextable > tbody').find("tr").remove();
	    			  $('#hextable > tbody:last').append(tr);
	    			 
			  	    	
			  	    	/*
			  	    	$.ajax({
				    		  url: '/convert.php?s='+_this.selection[0]+"&e="+_this.selection[1]+"&d="+bytedata,
				    		  success: function(data) {
				    			  
				    			  
				    			
				    			 
				    		    
				    			  
				    			  if (_this.selectedinput!=null) {
				 			  		// _this.selectedinput.select();
				 			  	   }
				    			  
				    		  }
				    		});
				    		*/
				    	  
			  	      }};
			    	
			  	      
			  	      var blob = null;
			  	      
			  	 	if (_this.file.slice) {
				  	      blob = _this.file.slice(_this.selection[0], Math.min( _this.selection[1]+1, _this.selection[0]+1+256 )  );
				  	    } else
			    	if (_this.file.webkitSlice) {
			  	        blob = _this.file.webkitSlice(_this.selection[0], Math.min( _this.selection[1]+1, _this.selection[0]+1+256 )  );
			  	    } else if (_this.file.mozSlice) {
			  	        blob = _this.file.mozSlice(_this.selection[0], Math.min( _this.selection[1]+1, _this.selection[0]+1+256 )  );
			  	    }
			  	 	if (blob!=null)
			  	    r.readAsArrayBuffer(blob);
			    	
			    
		    	
		    	
			  	   
			  	    
		    	$(".hexselection input.size").val( ""+( _this.selection[1]-_this.selection[0]+1 ) );
	    	}
	    	
	    	_this.loading = false;
	      }
	    };

	    var blob = null;
	    if (this.file.slice) {
		     blob = this.file.slice(start, stop + 1);
	    } else
	    if (this.file.webkitSlice) {
	        blob = this.file.webkitSlice(start, stop + 1);
	    } else if (this.file.mozSlice) {
	        blob = this.file.mozSlice(start, stop + 1);
	    }
	    if (blob!=null)
	    		reader.readAsArrayBuffer(blob);
	    else
	    		alert("sorry: your browser is not supported.");
  };
  

  var files = [];

  

  

  if (!Object.keys) Object.keys = function(o) {
    if (o !== Object(o))
      throw new TypeError('Object.keys called on a non-object');
    var k=[],p;
    for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
    return k;
  }

  
  var selectedalgo = "md5";
  
  var cryptjsscripts = ["core.js", "x64-core.js","md5.js","sha1.js","sha512.js","sha3.js","sha256.js","sha384.js","ripemd160.js" ];
  
  function loadCryptJsScripts(done)
  {
	  if (cryptjsscripts.length>0){
		  var js = cryptjsscripts.shift();
		  $.getScript("js/CryptoJS_v3.1.2/components/"+js, function(){
			  loadCryptJsScripts(done);
		  });		  
	  } else
		 done();
  }
  
  function calchash(algo, nr, dest){
	  
	  dest.html("<img src=\"/img/loading.gif\" />");
	  loadCryptJsScripts(function(){
	  
		  selectedalgo=algo;
		  
		  
		var file = files[nr];
		
		if (file==null)
			return;
		
		file = file.file;
		  
		var reader = new FileReader();
		  
		switch (algo){
		
		
			case "ripemd-160":
				algo = CryptoJS.algo.RIPEMD160.create();
			break;
			case "sha1-160":
				algo = CryptoJS.algo.SHA1.create({ outputLength: 160 });
			break;
			case "sha2-226":
				algo = CryptoJS.algo.SHA2.create({ outputLength: 226 });
			break;
			case "sha2-256":
				algo = CryptoJS.algo.SHA256.create();
			break;	
			case "sha2-512":
				algo = CryptoJS.algo.SHA512.create();
			break;
			case "sha3-512":
				algo = CryptoJS.algo.SHA3.create({ outputLength: 512 });
			break;
			
			case "sha256":
				algo = CryptoJS.algo.SHA256.create();
			break;
			
			case "sha384":
				algo = CryptoJS.algo.SHA384.create();
			break;
			
			case "sha512":
				algo = CryptoJS.algo.SHA512.create();
			break;
		
			default:
				algo = CryptoJS.algo.MD5.create();
			break;
		}
	
		
		var readnext = function(offset){ 
			
			if (file.size>0)
			dest.text( Math.round(100* offset / file.size )+ "%");
			
		  
			reader.onloadend = function(evt) {
			      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
			    	  
			    	  var bytes = new Uint8Array( evt.target.result );
			    	  var words = [];
			    	  var len = bytes.length;
			    	  
			    	  for (var i = 0; i < len; i++)
			    		  words[i >>> 2] |= (bytes[i] & 0xff) << (24 - (i % 4) * 8);
			    	  
			    	  algo.update( CryptoJS.lib.WordArray.create(words, len) );
			    	  
			    	  readnext( offset+bytes.length );
			      }
			};
			
			var toread = Math.min( file.size-offset, 64*1024);
			
			if (toread==0){
				
				var hash = algo.finalize();
				dest.text("0x"+hash);
				
			} else {
				
			  
				  blob = null;
				
				 var blob = null;
				    if (file.slice) {
					     blob = file.slice(offset,offset+  toread);
				    } else
				    	
				if (file.webkitSlice) {
					blob = file.webkitSlice(offset,offset+  toread );
				} else if (file.mozSlice) {
					blob = file.mozSlice(offset,offset+ toread );
				}
				if (blob)
					reader.readAsArrayBuffer(blob);
				
			}
			
		};
		
		readnext(0);	  
	  
	  });
		
  }
  
  
  
  
  var blobjsscripts = ["Blob.js","FileSaver.min.js"];
  
  function loadBlobJsScripts(done)
  {
	  if (blobjsscripts.length>0){
		  var js = blobjsscripts.shift();
		  $.getScript("js/"+js, function(){
			  loadBlobJsScripts(done);
		  });		  
	  } else
		 done();
  }  
  
  
  function addFile(_file)
  {
	  
	 
	  for (var i=0;i<files.length;i++)
  	  {
		  files[i].isactive = false;
  	  }
	  
	  
	  var file = _file;
	  var f= new HexFile( file.name );
	  
	  
	  
	  var tr = $("<tr />");
	  
	  var shortfilename = file.name;
      if (shortfilename.length>23)
    	  shortfilename = shortfilename.substring(0,21)+"..";
	  
	  $("<td class=\"\" title=\""+file.name+"\">"+shortfilename+"</td>").appendTo(tr);
	  
	  
	  var algos = "<option value=\"md5\">MD5</option>"+"<option value=\"sha1-160\">SHA-1 (160Bit)</option>"+"<option value=\"sha2-224\">SHA-2 (224Bit)</option>"+"<option value=\"sha2-256\">SHA-2 (256Bit)</option>"+"<option value=\"sha2-384\">SHA-2 (384Bit)</option>"+"<option value=\"sha2-512\">SHA-2 (512Bit)</option>"+"<option value=\"sha3-512\">SHA-3 (512Bit)</option>"+"<option value=\"sha256\">SHA (256Bit)</option>"+"<option value=\"sha384\">SHA (384Bit)</option>"+"<option value=\"sha512\">SHA (512Bit)</option>"+"<option value=\"ripemd-160\">RIPEMD (160Bit)</option>"+"<option value=\"\"></option>";
	  
	  $("<td class=\"\"><select>"+algos+"</select></td>").appendTo(tr);
	  $("<td class=\"hash\">"+"<input type=\"button\" value=\"calculate\" onclick=\"calchash('"+selectedalgo+"', "+files.length+" , $(this).parent());\" />"+"</td>").appendTo(tr);
	  
	  tr.find("select").find("option").each(function(){
		  var option = $(this);
		  if (option.attr("value")==selectedalgo)
			  option.attr("selected","selected");
	  });
	  
	  var length = files.length;
	  
	  
	  var evt = function(){
		  var select = $(this);
		  var _length = length;
		  //calchash(select.val(), _length, select.parent().parent().find('td.hash') );
		  select.parent().parent().find('td.hash').html("<input type=\"button\" value=\"calculate\" onclick=\"calchash('"+select.val()+"', "+_length+" , $(this).parent());\" />");
	  };
	  tr.find("select").mouseup(evt);
	  tr.find("select").keyup(evt);
	  	  
	  $('#checksumtable > tbody').append(tr);
	  
	  
	  return function() {
	  
	  f.i = files.length;
      f.selection=[0,0];
      f.changes = {};
      
      $("#hexes").find("div.hex").hide();
      $("#filenames").find("li").removeClass("active");
      
      var shortfilename = file.name;
      if (shortfilename.length>23)
    	  shortfilename = shortfilename.substring(0,21)+"..";
      var li = $("<li class=\"active\"><a href=\"#\"><span title=\""+file.name+"\" class=\"fname\">"+shortfilename+"<b class=\"percent\"></b></span> <span title=\"download file\" class=\"pull-right glyphicon glyphicon-download-alt\"></span> <span title=\"remove file\" class=\"pull-right glyphicon glyphicon-trash\"></span></a></li>");
      li.appendTo($("#filenames"));
      
      
      var percent = li.find("b.percent");
      
      var activate =function(){
    	  
    	  $("#filenames").find("li").removeClass("active");
    	  li.addClass("active");
    	  $("#hexes").find("div.hex").hide();
    	  f.div.show();
    	  
    	  for (var i=0;i<files.length;i++)
      	  {
    		  files[i].isactive = false;
      	  }
    	  
    	  f.isactive = true;
    	  f.readBlob( 0, 16*f.lines-1 );

    	  
      };
      
      li.find("a").click( activate );
      
      li.find(".glyphicon-trash").click(function(){
    	  li.remove();
    	  f.div.remove();
    	  f.isactive = false;
    	  
    	  $("#filenames li:first a").click();    	  
      });
      
      
      li.find(".glyphicon-download-alt").click(function(){
    	  
    	  percent.text(" 0%");
    	  percent.show();    	  
    	  
    	  var savefilename = file.name;

    	  var reader = new FileReader();
    	  var buffer = new ArrayBuffer(f.file.size);
    	  var data = new DataView(buffer);

    	  
    		var readnext = function(offset){ 
    			
    			if (f.file.size>0)
    				percent.text( " "+Math.round(100* offset / f.file.size )+ "%");
    			
    		  
    			reader.onloadend = function(evt) {
    			      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
    			    	  
    			    	  var bytes = new Uint8Array( evt.target.result );
    			    	  var len = bytes.length;
    			    	  
    			    	  for (var i = 0; i < len; i++)
    			    	  {
    			    		  data.setUint8(offset+i, bytes[i] );
    			    	  }
    			    	  
    			    	  readnext( offset+bytes.length );
    			      }
    			};
    			
    			var toread = Math.min( f.file.size-offset, 64*1024);
    			
    			if (toread==0){
    				
	  		    	percent.hide();
    				
    				var keys=Object.keys(f.changes);
	  		    	for (var i=0;i<keys.length;i++)
	  		    	{
	  		    		  var key = keys[i];
	  		    		  var index = parseInt( key );
	  		    		  var row = f.changes[ key ];
	  		    		  for (var j=0;j<16;j++)		    		  
	  		    		  {
	  		    			  var tmp = row[ j ];		    			  	    			    		  
	  			        	  if (tmp != null)
	  			        		  data.setUint8(index+j, tmp );		    			  		    			  
	  		    		  }		    		  
	  	    		}
    				
	  		    	
	  		    	loadBlobJsScripts( function(){
	  		    		saveAs( new Blob([buffer]), savefilename );
	  		    	});
    				
    				
    			} else {
    				
    			  
    				var blob = null;
    				if (f.file.slice) {
    					blob = f.file.slice(offset,offset+  toread );
    				} else
    				if (f.file.webkitSlice) {
    					blob = f.file.webkitSlice(offset,offset+  toread );
    				} else if (f.file.mozSlice) {
    					blob = f.file.mozSlice(offset,offset+ toread );
    				}
    				if (blob)
    					reader.readAsArrayBuffer(blob);
    				
    			}
    			
    		};
    		
    		readnext(0);	
    	     	  
    	 
    	  
      });
      
      
      
      f.div = $("<div class=\"hex\"></div>");      
      f.div.appendTo( $("#hexes") );
      
      
      
     
      
      f.div.load("static/hex/hex.php", function(){
      
	      
	      f.file = file;
	            
	      var modifyselectable = f.div.find( ".selectable" );
	      
	      var modifyvalues = f.div.find( ".modifyvalues");
	      
	    
	      f.div.find(".hexscroll").mousedown(function(){	    	  
	    	  var diff = new Date().getTime() - lastscrolltime;
	    	  if (diff > 1000){
	    		  window.setInterval( scroll, 100 );	    		 
	    	  }
	      });
	      
	      
	    //  modifyvalues.sortable();
	      
	      
	      var savefilename = file.name;
	      if (savefilename.indexOf(".")>0)
	    	  savefilename = savefilename.substring( 0,1+savefilename.lastIndexOf(".") )+"new"+savefilename.substring( savefilename.lastIndexOf(".") );
	      
	      f.div.find(".savefilename").val( savefilename );
	      
	      if (file.size>1024*1024*11)
	      {
	    	  f.div.find("input.savebtn").attr("disabled","disabled");
	    	  f.div.find(".savefilename").val("error: file too large.");
	      }
	      else
	    	  f.div.find("input.savebtn").removeAttr("disabled");
	      
	      
	 
	      
	      
	      /*
	      modifyselectable.selectable();
	      modifyselectable.selectable({
	    	  selected: function(event, ui) {
	    		   
	    		  modifyvalues.find("li").hide();
	    		  
	    		  var selected = modifyselectable.find(".ui-selected");
	    		  if (selected.hasClass("mstring"))
	    			  	modifyvalues.find(".mstring").show();
	    		  if (selected.hasClass("mhex"))
	    			  	modifyvalues.find(".mhex").show();
	    		  if (selected.hasClass("mbit"))
		    		    modifyvalues.find(".mbit").show();
	    		  if (selected.hasClass("muint"))
		    		    modifyvalues.find(".muint").show();
	    		  if (selected.hasClass("mint"))
		    		    modifyvalues.find(".mint").show();
	    		  if (selected.hasClass("mfloat"))
		    		    modifyvalues.find(".mfloat").show();
	    		  
	    	   }
	    	});
	      */
	      
	      var hexdump = f.div.find(".hexdump"); 
	      hexdump.mousedown(function(e){
	    	  if (e.button==0) 
	   		  {
	    		  
		    	  var relativeX = e.pageX - hexdump.offset().left;
			  	  var relativeY = e.pageY - hexdump.offset().top;
		    	  var s = Math.floor( f.position[0] + 16*Math.floor(relativeY/20) + (relativeX/24) );
		    	  f.selection = [ s, s ];
		    	  
		    	  f.div.find(".hexdump b").removeClass("selected");
	    	  
	   		  } else return false;
	      });
	      hexdump.mouseup(function(e){
			  
			  if (e.button==0) 
			  {
			  
		    	  var relativeX = e.pageX - hexdump.offset().left;
			  	  var relativeY = e.pageY - hexdump.offset().top;
		    	  var s = Math.floor( f.position[0] + 16*Math.floor(relativeY/20) + (relativeX/24) );
		    	  
		    	  var last = [f.selection[0],f.selection[1]];
		    	  
		    	  if (s<f.selection[0])
		   		  {
		    		  f.selection[1] = f.selection[0];
		    		  f.selection[0] = s;
		   		  }else
		    	   f.selection[1] = s;
		    	  
		    	  f.loading = false;
		    	  f.readBlob( f.position[0], f.position[1] );
		    	  
			  } else return false;
	      });
		  
		  
	      /*
	      hexdump.bind("contextmenu", function(e){		  
	    	  var relativeX = e.pageX - this.offsetLeft - hexdump.offset().left;
		  	  var relativeY = e.pageY - this.offsetTop - hexdump.offset().top;
	    	  var s = Math.floor( f.position[0] + 16*Math.floor(relativeY/20) + (relativeX/24) );
	    	  
	    	  var last = [f.selection[0],f.selection[1]];
	    	  
	    	 if (s>=last[0] && s<=last[1])
	   		 {
	   		   return true;
	   		 }
	    	  
	    	  if (s<f.selection[0])
	   		  {
	    		  f.selection[1] = f.selection[0];
	    		  f.selection[0] = s;
	   		  }else
	    	   f.selection[1] = s;
	    	  
	    	  f.loading = false;
	    	  f.readBlob( f.position[0], f.position[1] );
	    	  
	   		 if (s<last[0] || s>last[1])
	   		 {
	   		   e.preventDefault();
	   		   return false;
	   		 }
	    		  
	      });
	      */
		 
		  
	      var hextext = f.div.find(".hextext"); 
	      hextext.mousedown(function(e){
			  if (e.button==0) 
		   	    {
		   		   
		    	  var relativeX = e.pageX - hextext.offset().left;
			  	  var relativeY = e.pageY - hextext.offset().top;
		    	  var s = Math.floor( f.position[0] + 16*Math.floor(relativeY/20) + (relativeX/8) );
		    	  f.selection = [ s, s ];
		    	  f.div.find(".hextext b").removeClass("selected");
		   	    }
	      });
	      
	      hextext.mouseup(function(e){
	    	  
	    	  if (e.button==0) 
			  {
	    	  
		    	  var relativeX = e.pageX - hextext.offset().left;
			  	  var relativeY = e.pageY - hextext.offset().top;
		    	  var s = Math.floor( f.position[0] + 16*Math.floor(relativeY/20) + ((relativeX-5)/8) );
		    	  
		    	  if (s<f.selection[0])
		   		  {
		    		  f.selection[1] = f.selection[0];
		    		  f.selection[0] = s;
		   		  }else
		    	   f.selection[1] = s;
		    	  
		    	  f.loading = false;
		    	  f.readBlob( f.position[0], f.position[1] );
		    	  
			  }
	      });
	      
	      
	      f.div.find(".hexscale").show();
	      
	      
	      f.div.find(".hextitle").empty();
	      
	      
	      	      
	      
	      
	      
	      //f.div.find( ".tabs" ).tabs();
	      //f.div.find( ".tabs" ).show();
	      
	      
	      f.readBlob( 0, 16*f.lines-1 );
	      
	      files.push(f);
      });
      
     
    };
	  
  }
  
  
    
  function updateSelection(btn, op)
  {
	  
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  
	 // if (btn.parents( file.div ).length > 0)
	  
	  if (file.isactive)
	  {
		  var start = $( ".hexselection input.start").val();
		  var end = $(".hexselection input.end").val();
		  
		  start = parseInt( start , start.indexOf("0x")==0?16:10);
	      end = parseInt( end, end.indexOf("0x")==0?16:10);
	      
	      if (start>end){
	    	  var tmp = start;
	    	  start = end;
	    	  end = tmp;
	      }
	      
	      if (start<0) {
	    	  start = 0;
	    	  $( ".hexselection input.start").val("0x0");
	      }
	      
	      if (op=='size')
    	  {
	    	  var size = $(".hexselection input.size").val();
	    	  size = parseInt( size, size.indexOf("0x")==0?16:10  )
	    	  end = start + size -1;	    	  
    	  } 
	      
	      if (end > file.file.size) {
	    	  end = file.file.size-1;
	    	  $(".hexselection input.size").val(""+end);
	  		}
		  		  
		  file.selection = [ start, end ];		  
	      file.readBlob( file.position[0], file.position[1] );
	      file.lastscrolltop = top;
	      
	      break;
	  }
	}
	  
  }
  
  function handleFileSelect(evt) {
    
    if (evt.target.files.length>0)
    {
     for (var k=0;k<evt.target.files.length;k++)
     {
      var file = evt.target.files[k];
      
      addFile( file )();
     }
    }
    
  }
  
  
  HexFile.prototype.lastscrolltop = -1;
  
  
  var lastscrolltime = 0;
  
  function scroll()
  {	  
	  try{
		  for (var i=0;i<files.length;i++)
		  {
		
			if (files[i].file!=null)
			if (files[i].isactive)
			{
			 var top = files[i].div.find(".hexscroll").scrollTop();
			 
			 //var top = (files[i].file.size) - files[i].div.find(".hexscroll").find("div").slider( "option", "value" );
			 
			// if (ui)
			 {
				// if (files[i].div.find(".hexscroll").find("div").attr("id") != $(ui.handle).parent().attr("id")) 
				//	 continue;
				//top = (files[i].file.size) -  ui.value;				 
			 }
			 
			 if (top>=0 && top<=4294967295)
			 if ((top!=files[i].lastscrolltop) && (files[i].lastscrolltop!=-1))
			 {	 
			 				 
				 
			 	var start =  Math.floor( (files[i].file.size+32) * top/(files[i].div.find(".hexscroll").find("div").height() - files[i].div.find(".hexscroll").height() ) );
			 	start = 16*Math.round(start/16.0);
			 	
			 	// console.log( top+" "+start +" "+( ( top/(10000.0 - files[i].div.find(".hexscroll").height() ) )));
		     	files[i].readBlob( start , start+ 16* files[i].lines -1 );
		     	files[i].lastscrolltop = top;
			 }
			}
		  }
	  } catch (e) {}
	
	  lastscrolltime = new Date().getTime();
  }
  
  
  

  $(document).ready(function(){
	  
	  
	  $("#hextab a:first").tab('show');
	  
	  if (window.File && window.FileReader && window.FileList && window.Blob) {
	   
		 
		 
		  window.setInterval( scroll, 100 );
		  
				  
		  
		  document.getElementById('files').addEventListener('change', handleFileSelect, false);
		  
		
		  $("#hexvalues .val").keypress(function(e){

			  if (e.keyCode==13){
				  
				  var input = $(this);
				  
				  
				  
				  
				  var size = 8;
				  while (size <= 64){
					  if (input.hasClass("size"+size))
						  break;
					  size*=2;
				  }
				  size /=8;
				  
				  var endian = $("#endian").val();
		  	    	
				  
				  for (var i=0;i<files.length;i++)
					{
					  var file = files[i];
					  
					  if (file.isactive)
					  {
						  
					  		
						  
						  var type = input.attr("id");
						  var val = parseInt( input.val() );
						  switch(type){
						  	case "hex8":
						  		
						  		var rowchangeindex = ""+(file.selection[0] - file.selection[0]%16);
						  		var rowchangeoffset =  file.selection[0]%16;
						  										
							  	if (file.changes[ rowchangeindex ] === undefined)
							  		file.changes[ rowchangeindex ] = [null,null,null,null, null,null,null,null, null,null,null,null, null,null,null,null];
						  		
							  	file.changes[ rowchangeindex ][ rowchangeoffset ] = parseInt( input.val(), 16) & 0xFF;
							  								  	
						  		//file.changes[ ""+(file.selection[0]+0) ] = parseInt( input.val(), 16) & 0xFF;
						  		break;
						  	case "int8":
						  	case "int16":
						  	case "int32":
						  	case "int64":			
						  		
						  		if (val < 0){						  			
						  			val =Math.pow(2, 8*size)+val;						  			
						  		} 
						  		
						  		
							  		for (var i=0;i<size;i++){
							  			
								  		var rowchangeindex=0;
								  		var rowchangeoffset=0;
								  		
								  		if (endian=="little"){
								  			 rowchangeindex = ""+((file.selection[0]+i) - (file.selection[0]+i)%16);
									  		 rowchangeoffset =  (file.selection[0]+i)%16;
								  			
								  		} else
								  		{
								  			 rowchangeindex = ""+((file.selection[0]+size-1-i) - (file.selection[0]+size-1-i)%16);
									  		 rowchangeoffset =  (file.selection[0]+size-1-i)%16;								  			
								  		}
								  										
									  	if (file.changes[ rowchangeindex ] === undefined)
									  		file.changes[ rowchangeindex ] = [null,null,null,null, null,null,null,null, null,null,null,null, null,null,null,null];
								  		
									  	
									  	file.changes[ rowchangeindex ][ rowchangeoffset ] = val & 0xFF;		
							  										  			
							  			val>>=8;
							  		}
						  		
						  		break;
						     
						  	case "uint8":
						  	case "uint16":
						  	case "uint32":
						  	case "uint64":						  		
						  								  		
						  		for (var i=0;i<size;i++){
						  			
						  			
						  			var rowchangeindex=0;
							  		var rowchangeoffset=0;
							  		
							  		if (endian=="little"){
							  			 rowchangeindex = ""+((file.selection[0]+i) - (file.selection[0]+i)%16);
								  		 rowchangeoffset =  (file.selection[0]+i)%16;
							  			
							  		} else
							  		{
							  			 rowchangeindex = ""+((file.selection[0]+size-1-i) - (file.selection[0]+size-1-i)%16);
								  		 rowchangeoffset =  (file.selection[0]+size-1-i)%16;								  			
							  		}
							  										
								  	if (file.changes[ rowchangeindex ] === undefined)
								  		file.changes[ rowchangeindex ] = [null,null,null,null, null,null,null,null, null,null,null,null, null,null,null,null];
							  		
								  	
								  	file.changes[ rowchangeindex ][ rowchangeoffset ] = val & 0xFF;		
						  									  			
						  			val>>=8;
						  		}
						  		break;
						  		
						  }
						  
						  /*
						  $.ajax({
				  	    		url: '/convert.php?'+"&v="+encodeURIComponent( input.val() )+"&s="+size+"&t="+input.attr("id"),
					    		  success: function(data) {
					    		    
					    			  for (var i=0;i<data.length;i++)
					    			  {
					    				  if (data[i][0]=="data")
					    				  {
					    					  var d = data[i][1];
					    					  for (var j=0;j<d.length && j<(size/8);j++)		    			  
							    			  {
							    				  file.changes[ ""+(file.selection[0]+j) ] = d[j];
							    			  }	
					    					  //file.readBlob( file.position[0], file.position[1] );			    					  
					    				  }
					    			  }
					    		  }
					    		});
						  
						  */
						  
						  var start = file.selection[0];
						  
						  file.selectedinput = input;
						  file.selection = [ start+size, start+size-1+size ];		  
					      file.readBlob( file.position[0], file.position[1] );
					      file.lastscrolltop = top;  
						
					      
					      break;
					  }
					}
				  
				 
			  }
		  });
		  
		  $("#hexvalues .val").focus(function(){
			  
			  var input = $(this);
			  
			 
			  
			  var size = 8;
			  while (size <= 64){
				  if (input.hasClass("size"+size))
					  break;
				  size*=2;
			  }
			  size /=8;
			  
			  for (var i=0;i<files.length;i++)
				{
				  var file = files[i];
				  
				  file.selectedinput = input;
				  input.select();
				  
				  //if (inp.parents( file.div ).length > 0)
				  if (file.isactive)
				  {
					  var start = file.selection[0]; 
					  file.selection = [ start, start+size-1 ];		  
				      file.readBlob( file.position[0], file.position[1] );
				      file.lastscrolltop = top;  
				  }
				}
		  });
		  
		  
	  } else {
	    alert('The File APIs are not fully supported in this browser.');
	  }  
  });
  
  
  
  
function modifyvalue( inp, type, size, enter )
{
	
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  
	  //if (inp.parents( file.div ).length > 0)
	  if (file.isactive)
	  {
		  
		  
		  var r = new FileReader();
	  	    r.onloadend = function(evt) {
	  	      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
	  	    	  
	  	    	var bytes = new Uint8Array( evt.target.result );
	  	    	
	  	    	var bytedata = "";
	  	    	for (var i=0;i<bytes.length;i++)
	  	    	{
	  	    		var c = bytes[i].toString(16);
	  	    		while (c.length<2) c = "0"+c;
	  	    		bytedata += c;			  	    		
	  	    	}
	  	    	  
	  	    	/*
	  	    	$.ajax({
	  	    		url: '/convert.php?s='+file.selection[0]+"&e="+file.selection[1]+"&d="+bytedata+"&v="+encodeURIComponent( inp.val() )+"&s="+size+"&t="+type,
		    		  success: function(data) {
		    			  
		    			  
		    			
		    		    
		    			  for (var i=0;i<data.length;i++)
		    			  {
		    				  if (data[i][0]=="data")
		    				  {
		    					  var d = data[i][1];
		    					  for (var j=0;j<d.length && j<(size/8);j++)		    			  
				    			  {
				    				  file.changes[ ""+(file.selection[0]+j) ] = d[j];
				    			  }	
		    					  file.readBlob( file.position[0], file.position[1] );
		    					  
		    				  } else
		    				  file.div.find( "input.value_"+ data[i][0] ).val( data[i][1] );
		    			  }
		    		    
		    			  
		    			  
		    			  
		    		  }
		    		});
		    		*/
		    	  
	  	      }};
	    	
	  	      
	  	      var blob = null;
	  	      
	  	  	if (file.file.slice) {
		  	        blob = file.file.slice(file.selection[0], file.selection[0]+16 );
		  	    } else 
	    	if (file.file.webkitSlice) {
	  	        blob = file.file.webkitSlice(file.selection[0], file.selection[0]+16 );
	  	    } else if (file.file.mozSlice) {
	  	        blob = file.file.mozSlice(file.selection[0], file.selection[0]+16  );
	  	    }
	  	  	
	  	  	if (blob!=null)
	  	    r.readAsArrayBuffer(blob);
			
		  
	  	    if (enter)
		  	{	  	    	
	  	    			  		
		  		
		  	}
	  	    
	  	    break;
	  }
	  
	}
	
	
	
	  
}
function modifyvaluefocus( inp, type, size )
{
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  
	  if (file.isactive)
	  {
		  var start = $( ".hexselection input.start").val();
		  var end = $(".hexselection input.end").val();
		  
		  start = parseInt( start , start.indexOf("0x")==0?16:10);
	      end = start + size/8-1 ;
	      	      	  
		  file.selection = [ start, end ];		  
	      file.readBlob( file.position[0], file.position[1] );
	      file.lastscrolltop = top;  
	  }
	}
}
  


var searchcancel = false;

function search()
{
	
	searchcancel = false;
	
	var searchfound = false;
	
	var findhex = $("#findhex").val();	
	var hexes = [];	
	{
		var tmp = findhex.split(' ');
		for (var i=0;i<tmp.length;i++)
			hexes.push( parseInt( tmp[i], 16 ) );
	}
		
	
	var searchindex = 0;
	
	if (hexes.length==0)
		return;
	
	
	var findoffset = $("#findoffset");
	
	findoffset = (findoffset.val().length>0)?( parseInt(findoffset.val()) ):0;
	
	  
	var reader = new FileReader();
	
	var status = $("#findstatus");
	
	for (var i=0;i<files.length;i++)
	{
	  var file = files[i];
	  var _file = file;
	  
	  if (file.isactive)
	  {
		  file = file.file;
		  
		  var readnext = function(offset){ 
				
				if (file.size>0)
					status.text( Math.round(100* offset / file.size )+ "%");
							  
				reader.onloadend = function(evt) {
				      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
				    	  
				    	  var bytes = new Uint8Array( evt.target.result );
				    	  var len = bytes.length;
				    	  
				    	  for (var i = 0; i < len; i++)
				    	  {
				    		  if ( hexes[searchindex] == bytes[i] ) {
				    			  searchindex++;
				    			  if (searchindex==hexes.length){
				    				  
				    				  //alert( "found @ "+ (offset+i) );
				    				  {
				    					  var start = offset+i-hexes.length+1;
				    					  var end = offset+i;
				    					  
				    					  _file.position[0] = start - start % 16;
				    					  _file.position[1] = _file.position[0]+16*24;
				    					  
				    					  _file.selection = [ start, end ];		  

				    				      var top = Math.floor((10000 - _file.div.find(".hexscroll").height() )*(_file.position[0]) / _file.file.size);
				    				      _file.div.find(".hexscroll").scrollTop( _file.lastscrolltop = top );
				    					  
				    					  _file.readBlob( _file.position[0], _file.position[1] );
				    				      
				    				  }
				    				  
				    				  $("#findoffset").val( offset+i );
				    				
				    				  searchfound = true;
				    				  break;
				    			  }
				    		  } else
				    		  {
				    			  searchindex=0;				    			  				    			  
				    		  }
 				    		  
				    	  }
				    	  
				    	  readnext( offset+bytes.length );
				      }
				};
				
				var toread = Math.min( file.size-offset, 64*1024);
				
				if (searchfound) {
					
					status.text("");
					
				} else
				
				if (toread==0) {
					
					status.text("not found.");
					
				} else if (searchcancel){
					
					status.text("");
										
				} else {
					
				  
					var blob = null;
					if (file.slice) {
						blob = file.slice(offset,offset+  toread );
					} else
					if (file.webkitSlice) {
						blob = file.webkitSlice(offset,offset+  toread );
					} else if (file.mozSlice) {
						blob = file.mozSlice(offset,offset+ toread );
					}
					if (blob)
						reader.readAsArrayBuffer(blob);
					
				}
				
			};
			
			readnext(findoffset);
			break;
	  }
	}
	 
}
function searchreplace()
{
}

function searchupdate()
{
	var findtext = $("#findtext");
	var findhex = $("#findhex");
	var findtype = $("#findtype");
	var status = $("#findstatus");
	
	var text = findtext.val();
	var hex = "";
	
	switch (findtype.val()){
		case "string":
			for (var i=0;i<text.length;i++){
				var ch = text.charCodeAt(i);
				ch = ch.toString( 16 );
				if (ch.length==1) ch="0"+ch;
				hex+=ch+" ";
			}
		break;
		case "uint8":
			hex = parseInt( text ).toString( 16 ) & 0xFF;
		break;
	}
	
	findhex.val($.trim(hex));
	
	$("#findoffset").val("0");
	
	status.text("");
	
}
