<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
        <title>My Store Locator</title>
        <link href="css/site.css" rel="stylesheet" type="text/css"/>
        <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
        <link href="css/bootstrap-theme.min.css" rel="stylesheet" type="text/css"/>
        
        <script src="http://maps.googleapis.com/maps/api/js?sensor=false&libraries=places"></script>
        <script src="js/jquery-1.11.1.min.js" type="text/javascript"></script>
        <script src="js/bootstrap.min.js" type="text/javascript"></script>
        <script src="js/map.js" type="text/javascript"></script>
        <script type="text/javascript">
            //<![CDATA[
            

            //]]>
        </script>
    </head>
    <body style="margin:0px; padding:0px;" onload="load()"> 
        <div id="addrSection">
            <input type="text" id="addressInput" size="10" placeholder="Search by location"/>
        </div>
        <div id="resultSection" style="display: none;">
            <div id="carousel-example-generic" class="carousel slide" data-ride="carousel" data-interval="false">
                <div class="carousel-inner">
                    <div class="item active">
                        <a href="#" class="list-group-item active">
                            Nearest 5 stores
                        </a>            
                        <ul class="list-group" id="list-group">                
                        </ul>
                    </div>
                    <div class="item">
                        <a href="#" class="list-group-item active">
                            <input type="button" class="btn btn-default btn-xs" href="#" value="Back" onclick="clearDirections();"/>&nbsp;&nbsp;
                            Driving Directions
                        </a>            
                        <div class="cls-directions">
                            <div id="directionsSection"></div>
                        </div>  
                    </div>
                    <div class="item">
                        <a href="#" class="list-group-item active">
                            <input type="button" class="btn btn-default btn-xs" href="#" value="Back" onclick="$('.carousel').carousel(0);"/>&nbsp;&nbsp;
                            Distance Matrix
                        </a>            
                        <div class="cls-directions">
                            <div id="distanceSection">
                                <b>From : </b> <span id="disFrom"></span><hr/>
                                <b>To : </b> <span id="disTo"></span><hr/>
                                <b>Distance : </b> <span id="disDistance"></span><hr/>
                                <b>Duration : </b> <span id="disDuration"></span><hr/>
                            </div>
                        </div>  
                    </div>
                </div>
            </div>
        </div>
        <div id="map" style="width: 100%; height: 100%"></div>
    </body>
</html>