/**
 * mSelect移动端选择器 IOS 版
 *
 * version:1.0.1
 *
 * author:Gavin
 *创建于：2017-3-12
 * 最近修改于： 2017-3-12
 */
(function ($) {
    $.fn.mselect = function (options) {
        var defaults = {
            url: "",//请求的url，如果为空或者没有设置，那么必须传data
            method: 'post',
            keys:{},//自定义数据字段
            dataType: 'json',//返回数据类型
            data: null,
            param:{},//请求传参数
            index:0,//未来扩展多项选择默认项
            value:[0],//呼出后默认选中项
            onSelect: null //选中项方法，返回选中项对象
        };
        var settings = $.extend({}, defaults, options);
        var _this=$(this);

        bindEvent();

        function getData (callback) {
            var _self = this;
            if (typeof settings.data == "object") {
                _self.data = settings.data;
                callback();
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('get', settings.data);
                xhr.onload = function (e) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                        var responseData = JSON.parse(xhr.responseText);
                        _self.data = responseData.data;
                        if (callback) {
                            callback()
                        }
                    }
                }
                xhr.send();
            }
        }

        function bindEvent () {
            var _self = this;
            //呼出插件
            function popupArea(e) {
                _self.gearMselect = document.createElement("div");
                _self.gearMselect.className = "mobileSelect";
                _self.gearMselect.innerHTML = '<div class="mselect_ctrl slideInUp">' +
                    '<div class="mselect_btn_box">' +
                    '<div class="mselect_btn mselect_cancel">取消</div>' +
                    '<div class="mselect_btn mselect_finish">确定</div>' +
                    '</div>' +
                    '<div class="mselect_roll_mask">' +
                    '<div class="mselect_roll">' +
                    '<div>' +
                    '<div class="mselect mselect_item" data-mselecttype="mselect_item"></div>' +
                    '<div class="mselect_grid">' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                document.body.appendChild(_self.gearMselect);
                mselectCtrlInit();
                var mselect_cancel = _self.gearMselect.querySelector(".mselect_cancel");
                mselect_cancel.addEventListener('touchstart', function (e) {
                    close(e);
                });
                var mselect_finish = _self.gearMselect.querySelector(".mselect_finish");
                mselect_finish.addEventListener('touchstart', function (e) {
                    finish(e);
                });
                var area_province = _self.gearMselect.querySelector(".mselect_item");
                area_province.addEventListener('touchstart', gearTouchStart);
                area_province.addEventListener('touchmove', gearTouchMove);
                area_province.addEventListener('touchend', gearTouchEnd);
            }

            //初始化插件默认值
            function mselectCtrlInit() {
                _self.gearMselect.querySelector(".mselect_item").setAttribute("val", settings.value[0]);
                _self.gearMselect.querySelector(".mselect_grid").innerHTML='<div class="ui-txt-center" style="line-height: 1.9em;">加载中...</div>';
                if(settings.url){
                    $.ajax({
                        type: settings.method,
                        url: settings.url,
                        data: settings.param,
                        dataType: settings.dataType,
                        success:function(json){
                            settings.data=json;
                            if(json.length>0){
                                _self.gearMselect.querySelector(".mselect_grid").innerHTML='';
                                setGearTooth(settings.data);
                            }else{
                                _self.gearMselect.querySelector(".mselect_grid").innerHTML='<div class="ui-txt-center" style="line-height: 1.9em;">暂无对应结果</div>';
                            }
                        }
                    })
                }else{
                    _self.gearMselect.querySelector(".mselect_grid").innerHTML='';
                    setGearTooth(settings.data);
                }
            }

            //触摸开始
            function gearTouchStart(e) {
                e.preventDefault();
                var target = e.target;
                while (true) {
                    if (!target.classList.contains("mselect")) {
                        target = target.parentElement;
                    } else {
                        break
                    }
                }
                clearInterval(target["int_" + target.id]);
                target["old_" + target.id] = e.targetTouches[0].screenY;
                target["o_t_" + target.id] = (new Date()).getTime();
                var top = target.getAttribute('top');
                if (top) {
                    target["o_d_" + target.id] = parseFloat(top.replace(/em/g, ""));
                } else {
                    target["o_d_" + target.id] = 0;
                }
                target.style.webkitTransitionDuration = target.style.transitionDuration = '0ms';
            }

            //手指移动
            function gearTouchMove(e) {
                e.preventDefault();
                var target = e.target;
                while (true) {
                    if (!target.classList.contains("mselect")) {
                        target = target.parentElement;
                    } else {
                        break
                    }
                }
                target["new_" + target.id] = e.targetTouches[0].screenY;
                target["n_t_" + target.id] = (new Date()).getTime();
                var f = (target["new_" + target.id] - target["old_" + target.id]) * 30 / window.innerHeight;
                target["pos_" + target.id] = target["o_d_" + target.id] + f;
                target.style["-webkit-transform"] = 'translate3d(0,' + target["pos_" + target.id] + 'em,0)';
                target.setAttribute('top', target["pos_" + target.id] + 'em');
                if (e.targetTouches[0].screenY < 1) {
                    gearTouchEnd(e);
                }
            }

            //离开屏幕
            function gearTouchEnd(e) {
                e.preventDefault();
                var target = e.target;
                while (true) {
                    if (!target.classList.contains("mselect")) {
                        target = target.parentElement;
                    } else {
                        break;
                    }
                }
                var flag = (target["new_" + target.id] - target["old_" + target.id]) / (target["n_t_" + target.id] - target["o_t_" + target.id]);
                if (Math.abs(flag) <= 0.2) {
                    target["spd_" + target.id] = (flag < 0 ? -0.08 : 0.08);
                } else {
                    if (Math.abs(flag) <= 0.5) {
                        target["spd_" + target.id] = (flag < 0 ? -0.16 : 0.16);
                    } else {
                        target["spd_" + target.id] = flag / 2;
                    }
                }
                if (!target["pos_" + target.id]) {
                    target["pos_" + target.id] = 0;
                }
                rollGear(target);
            }

            //缓动效果
            function rollGear(target) {
                var d = 0;
                var stopGear = false;

                function setDuration() {
                    target.style.webkitTransitionDuration = target.style.transitionDuration = '200ms';
                    stopGear = true;
                }

                clearInterval(target["int_" + target.id]);
                target["int_" + target.id] = setInterval(function () {
                    var pos = target["pos_" + target.id];
                    var speed = target["spd_" + target.id] * Math.exp(-0.03 * d);
                    pos += speed;
                    if (Math.abs(speed) > 0.1) {
                    } else {
                        var b = Math.round(pos / 2) * 2;
                        pos = b;
                        setDuration();
                    }
                    if (pos > 0) {
                        pos = 0;
                        setDuration();
                    }
                    var minTop = -(target.dataset.len - 1) * 2;
                    if (pos < minTop) {
                        pos = minTop;
                        setDuration();
                    }
                    if (stopGear) {
                        var gearVal = Math.abs(pos) / 2;
                        setGear(target, gearVal);
                        clearInterval(target["int_" + target.id]);
                    }
                    target["pos_" + target.id] = pos;
                    target.style["-webkit-transform"] = 'translate3d(0,' + pos + 'em,0)';
                    target.setAttribute('top', pos + 'em');
                    d++;
                }, 30);
            }

            //控制插件滚动后停留的值
            function setGear(target, val) {
                val = Math.round(val);
                target.setAttribute("val", val);
            }

            getData(function () {
                _this.on('click', popupArea);
            });
        }

        function setGearTooth (data) {
            var _self = this;
            var item = data || [];
            var l = item.length;
            var gearChild = _self.gearMselect.querySelectorAll(".mselect");
            var gearVal = gearChild[settings.index].getAttribute('val');
            var maxVal = l - 1;
            if (gearVal > maxVal) {
                gearVal = maxVal;
            }
            gearChild[settings.index].setAttribute('data-len', l);
            if (l > 0) {
                var id = item[gearVal][settings.keys['id']];
                var childData;
                childData = item[gearVal].child;
                var itemStr = "";
                for (var i = 0; i < l; i++) {
                    itemStr += "<div class='tooth'  ref='" + item[i][settings.keys['id']] + "'>" + item[i][settings.keys['name']] + "</div>";
                }
                gearChild[settings.index].innerHTML = itemStr;
                gearChild[settings.index].style["-webkit-transform"] = 'translate3d(0,' + (-gearVal * 2) + 'em,0)';
                gearChild[settings.index].setAttribute('top', -gearVal * 2 + 'em');
                gearChild[settings.index].setAttribute('val', gearVal);
            } else {
                gearChild[settings.index].innerHTML = "<div class='tooth'></div>";
                gearChild[settings.index].setAttribute('val', 0);
                if (settings.index == 1) {
                    gearChild[2].innerHTML = "<div class='tooth'></div>";
                    gearChild[2].setAttribute('val', 0);
                }
                settings.index = 0;
            }
        }

        function finish (e) {
            var _self = this;
            var mselect_item = _self.gearMselect.querySelector(".mselect_item");
            var itemVal = parseInt(mselect_item.getAttribute("val"));
            var itemLen=parseInt(mselect_item.getAttribute("data-len"));
            if(itemLen>0){
                var itemText = mselect_item.childNodes[itemVal].textContent;
                var itemCode = mselect_item.childNodes[itemVal].getAttribute('ref');
                settings.onSelect({selectText:itemText,selectCode:itemCode});
            }
            close(e);
        }

        function close (e) {
            e.preventDefault();
            var _self = this;
            var evt = new CustomEvent('input');
            _self.dispatchEvent(evt);
            document.body.removeChild(_self.gearMselect);
            _self.gearMselect = null;
        }
        return this;
    };

}($));