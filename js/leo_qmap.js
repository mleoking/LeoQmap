var map = null;

var qmapInit = function () {
    var center = new qq.maps.LatLng(22.541941, 113.955903);
    map = new qq.maps.Map(document.getElementById('container'), {
        center: center,
        zoom: 17
    });

    var drawingManager = new qq.maps.drawing.DrawingManager({
        drawingMode: qq.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: qq.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                qq.maps.drawing.OverlayType.MARKER,
                qq.maps.drawing.OverlayType.CIRCLE,
                qq.maps.drawing.OverlayType.POLYGON,
                qq.maps.drawing.OverlayType.POLYLINE,
                qq.maps.drawing.OverlayType.RECTANGLE
            ]
        },
        circleOptions: {
            fillColor: new qq.maps.Color(255, 208, 70, 0.3),
            strokeColor: new qq.maps.Color(88, 88, 88, 1),
            strokeWeight: 3,
            clickable: false
        }
    });
    drawingManager.setMap(map);
    qq.maps.event.addListener(drawingManager, 'overlaycomplete', function (res) {
        if (res.type == "marker") {
            document.getElementById("info").innerHTML += "点: " + res.overlay.getPosition().lng.toFixed(6) + "_" + res.overlay.getPosition().lat.toFixed(6)
            document.getElementById("info").innerHTML += "<br/>";
        }

        if (res.type == "polygon") {
            var paths = [];
            document.getElementById("info").innerHTML += "多边形: "
            var path = res.overlay.getPath().forEach(function (e) {
                document.getElementById("info").innerHTML += e.getLng().toFixed(6) + "_" + e.getLat().toFixed(6) + ";";
                paths.push(new qq.maps.LatLng(e.getLat(), e.getLng()));
            });
            document.getElementById("info").innerHTML += "<br/>";

            var polygon = new qq.maps.Polygon({
                map: map,
                path: paths,
                strokeColor: new qq.maps.Color(0, 0, 0, 0.8),
                fillColor: qq.maps.Color.fromHex("#FFFFFF", 0.5)
            });
        }

        if (res.type == "circle") {
            document.getElementById("info").innerHTML += "圆心: " + res.overlay.getCenter().getLng().toFixed(6) + "_" + res.overlay.getCenter().getLat().toFixed(6) + " 半径: " + res.overlay.getRadius().toFixed(3);
            document.getElementById("info").innerHTML += "<br/>";

            var circle = new qq.maps.Circle({
                map: map,
                center: new qq.maps.LatLng(res.overlay.getCenter().getLat(), res.overlay.getCenter().getLng()),
                radius: res.overlay.getRadius(),
                strokeWeight: 2
            });
        }
    });
}

var colors = { red: '#F62229', yellow: '#F6E922', green: '#44B901', blue: '#0678E3', purple: '#AC04EA', black: '#000000' };

var markerType = {
    defalut: '', black: 'marker_black.png', blue: 'marker_blue.png', green: 'marker_green.png', orange: 'marker_orange.png', purple: 'marker_purple.png', red: 'marker_red.png',
    black_hollow: 'marker_black_hollow.png', blue_hollow: 'marker_blue_hollow.png', green_hollow: 'marker_green_hollow.png', orange_hollow: 'marker_orange_hollow.png', purple_hollow: 'marker_purple_hollow.png', red_hollow: 'marker_red_hollow.png'
};

var drawPolygon = function (polygonStr, lonLatDelimiter = ',', posDelimiter = ';', color = colors.blue) {
    if (polygonStr) {
        var polygonStrs = polygonStr.split(posDelimiter);
        if (polygonStrs.length > 1) {
            var mcenter = null;
            var polygonPath = [];
            for (i = 0; i < polygonStrs.length; i++) {
                var pos = polygonStrs[i].split(lonLatDelimiter);
                if (pos.length >= 2) {
                    var lon = Number(pos[0]);
                    var lat = Number(pos[1]);
                    var qpos = new qq.maps.LatLng(lat, lon);
                    polygonPath.push(qpos);
                    if (mcenter == null) {
                        mcenter = qpos;
                    }
                }
            }
            var polygon = new qq.maps.Polygon({
                path: polygonPath,
                strokeColor: color,
                strokeWeight: 2,
                fillColor: new qq.maps.Color(0, 45, 168, 0.3),
                map: map
            });
            map.panTo(mcenter);
        }
    }
};

var drawMarker = function (lon, lat, label = '', mt = markerType.defalut, delta = 0) {
    var pos = new qq.maps.LatLng(lat + delta, lon + delta);
    var marker = null;

    if (mt.length > 0) {
        var anchor = new qq.maps.Point(12, 24),
            size = new qq.maps.Size(24, 24),
            origin = new qq.maps.Point(0, 0),
            icon = new qq.maps.MarkerImage('image/' + mt, size, origin, anchor);

        marker = new qq.maps.Marker({
            icon: icon,
            map: map,
            position: pos
        });
    } else {
        marker = new qq.maps.Marker({
            position: pos,
            map: map
        });
    }

    if (label.length > 0) {
        var label = new qq.maps.Label({
            position: pos,
            map: map,
            content: label
        });
    }
    map.panTo(pos);
};

var drawLabel = function (lon, lat, label = '') {
    pos = new qq.maps.LatLng(lat, lon);
    if (label.length > 0) {
        var label = new qq.maps.Label({
            position: pos,
            map: map,
            content: label
        });
    }
    map.panTo(pos);
};

var drawCirle = function (lon, lat, radius = 2, strokeColor = colors.blue) {
    pos = new qq.maps.LatLng(lat, lon);
    var cirle = new qq.maps.Circle({
        center: pos,
        radius: radius,
        strokeColor: strokeColor,
        //fillColor: fillColor,
        strokeWeight: 2,
        map: map
    });
    map.panTo(pos);
};

var drawLine = function (lonFrom, latFrom, lonTo, latTo, strokeWeight = 2, strokeColor = colors.blue) {
    posFrom = new qq.maps.LatLng(latFrom, lonFrom);
    posTo = new qq.maps.LatLng(latTo, lonTo);
    var polyline = new qq.maps.Polyline({
        path: [posFrom, posTo],
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
        map
    });
    map.panTo(posFrom);
};

var drawNetwork = function (nodes, edges) {
    pos = null;
    for (i = 0; i < nodes.length; i++) {
        drawCirle(nodes[i].lon, nodes[i].lat, nodes[i].value, nodes[i].color);
        if (nodes[i].label.length > 0) {
            drawLabel(nodes[i].lon, nodes[i].lat, nodes[i].label);
        }
        if (pos == null) {
            pos = new qq.maps.LatLng(nodes[i].lat, nodes[i].lon);
        }
    }
    for (i = 0; i < edges.length; i++) {
        nodeFrom = nodes[edges[i].from - 1]
        nodeTo = nodes[edges[i].to - 1]
        drawLine(nodeFrom.lon, nodeFrom.lat, nodeTo.lon, nodeTo.lat, edges[i].value, nodeFrom.color);
    }
    map.panTo(pos);
};

var drawMarkers = function (sMarkers, lonLatDelimiter = '_', posDelimiter = ';', mt = markerType.defalut, delta = 0) {
    var markers = sMarkers.split(posDelimiter);
    for (i = 0; i < markers.length; i++) {
        var pos = markers[i].split(lonLatDelimiter);
        var lon = Number(pos[0]);
        var lat = Number(pos[1]);
        var label = '';
        if (pos.length >= 3) {
            label = pos[2];
        }
        drawMarker(lon, lat, label, mt, delta);
    }
}

var drawHeat = function (heatData) {
    //地图异步加载，在idle或者tilesloaded后初始化
    qq.maps.event.addListenerOnce(map, "idle", function () {
        if (QQMapPlugin.isSupportCanvas) {
            heatmap = new QQMapPlugin.HeatmapOverlay(map,
                {
                    "radius": 1, //点半径，设置为1即可
                    "maxOpacity": 0.8, //热力图最大透明度
                    "useLocalExtrema": false,//是否在每一屏都开启重新计算，如果为true则每一屏都会有一个红点
                    "valueField": 'count'//设置大小字段
                }
            );
            //绘制热力图         
            heatmap.setData(heatData);
        } else {
            alert("您的浏览器不支持canvas，无法绘制热力图！！")
        }
    });

    pos = new qq.maps.LatLng(heatData.data[0]["lat"], heatData.data[0]["lng"]);
    map.panTo(pos);

    //
    qq.maps.event.addListener(map, 'mousemove', function (event) {
        var latLng = event.latLng,
            lat = latLng.getLat().toFixed(3),
            lng = latLng.getLng().toFixed(3)
        count = 0;

        fLen = heatData.data.length;
        for (i = 0; i < fLen; i++) {
            if (heatData.data[i]["lng"] == lng && heatData.data[i]["lat"] == lat) {
                count = heatData.data[i]["count"];
                break;
            }
        }
        document.getElementById("latLng").innerHTML = '热力点: ' + lng + '_' + lat + '_' + count;
    });
}