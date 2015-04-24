/*
 * jqRating.js  星级评分效果插件
 * author : zhaoyong
 */
(function ($) {
    $.fn.jqRating = function (options) {
        if (this.length > 0) {
            return this.each(function (i, item) {
                var opts = $.extend($.fn.jqRating.options, options);
                if (opts && opts.iconPath) {
                    // 加载评分图片，这里使用添加图片到body元素并设置其隐藏。来获取评分图片的高度和宽度
                    var image = $('<img>', {
                        src: '' + opts.iconPath
                    }).bind({
                        load: function () {
                            opts.starInfo = {
                                width: image.width(),
                                height: image.height(),
                                image: image.attr('src')
                            };
                            $(this).remove();
                            _jqRating(item);
                        },
                        error: function () {
                            // 图片不存在，加载不成功
                            $(this).errorLoad = true;
                            // 移除元素
                            $(this).remove();
                        }
                    }).appendTo('body');
                }

                // 生成评分的dom
                function _jqRating(elem) {
                    if (opts.starInfo.image) {
                        //计算一个星代表的分值
                        var quotient = parseFloat(opts.maxRate / opts.length);
                        // 评分容器
                        var container = $('<div>', {
                            'class': 'jqRatingContainer',
                            css: {
                                width: opts.starInfo.width * opts.length,
                                height: opts.starInfo.height,
                                overflow: 'hidden'
                            },
                            html: [$('<div>', {   // 评分星星
                                'class': 'jqRatingStar',
                                css: {
                                    width: opts.starInfo.width * opts.length,
                                    background: 'url("' + opts.starInfo.image + '") repeat-x',
                                    zIndex: 2
                                }
                            }), $('<div>', {  // 平均评分
                                'class': 'jqRatingAverage',
                                css: {
                                    width: getRate((opts.average) / quotient * opts.starInfo.width, quotient) * opts.starInfo.width,
                                    top: -opts.starInfo.height,
                                    zIndex: 1
                                }
                            })]
                        }).appendTo($(elem));

                        // 评分提示
                        var tooltip = $('<p>', {
                                'class': 'jqRatingTip',
                                html: $('<span>', {
                                    class: 'rate',
                                    html: ' / ' + opts.maxRate
                                })
                            }
                        ).appendTo($(elem));

                        if (!opts.disabled) {
                            $(container).bind({
                                'mouseenter': function () {  //鼠标移动到对象内，添加tooltip
                                    //获取鼠标位置
                                    var pos = getElementPos(this);
                                    $(tooltip).fadeIn();
                                },
                                'mouseover': function () {
                                    $('.jqRatingAverage', this).width(0);
                                    $(this).css('cursor', 'pointer');
                                },
                                'mousemove': function () {  //鼠标在对象上移动，实时显示分数
                                    //获取鼠标位置
                                    var pos = getElementPos(this);
                                    var rateTempWidth = event.clientX - (pos && (pos.x || 0));

                                    //计算评分
                                    var rateWidth = rateTempWidth || 0;
                                    var rate = getRate(rateWidth, quotient);
                                    $('span.rate', $(tooltip)).html(rate + " / " + opts.maxRate);
                                    //设置tip提示的位置
                                    $(tooltip).css({
                                        top: pos.y - ($(tooltip).height() + 20) >= 0 ? pos.y - ($(tooltip).height() + 20) : pos.y + 20,
                                        left: event.clientX + 5 - ($(tooltip).width() / 2)
                                    });

                                    //设置用户评分
                                    $('.jqRatingAverage', this).width(rate / quotient * opts.starInfo.width);
                                },
                                'mouseleave': function () {
                                    $(tooltip).fadeOut();
                                },
                                'mouseout': function () {  //鼠标移出评分区域，展示平均评分
                                    $('.jqRatingAverage', this).width(getRate((opts.average) / quotient * opts.starInfo.width, quotient) * opts.starInfo.width);
                                    $(this).css('cursor', 'default');
                                },
                                click: function () {  //提交评分
                                    //取消鼠标事件
                                    $(this).unbind().css('cursor', 'default');
                                    $(tooltip).fadeOut('fast');

                                    //计算用户评分
                                    var rateWidth = $('.jqRatingAverage', this).width() || 0;
                                    var rate = getRate(rateWidth, quotient);
                                    //提交评分
                                    if (opts.url) {
                                        $.ajax({
                                            type: 'POST',
                                            url: opts.url,
                                            dataType: 'json',
                                            data: { 'rate': rate },
                                            success: function (data) {
                                            }
                                        });
                                    }
                                }
                            })
                        }
                    }
                }

                function getElementPos(dom) {  //获取元素的坐标
                    var pos = {};
                    if (dom) {
                        pos = {
                            x: ((dom.offsetLeft || 0) + (dom.scrollLeft || 0) + (getElementPos(dom.offsetParent).x || 0)) || 0,
                            y: ((dom.offsetTop || 0) + (dom.scrollTop || 0) + (getElementPos(dom.offsetParent).y || 0)) || 0,
                            width: dom.clientWidth || 0,
                            height: dom.clientHeight || 0
                        };
                    }
                    return pos;
                }

                function getRate(rateWidth, quotient) {  //计算用户评分
                    var rate = 0;
                    if (rateWidth) {
                        rate = rateWidth / opts.starInfo.width;
                        if (opts.decimal) {
                            rate = Math.round(rate * (opts.decimal * 10)) / (opts.decimal * 10);
                        } else {
                            rate = Math.ceil(rate);
                        }
                        rate = rate * quotient;
                    }
                    return rate;
                }
            });
        }
    };
    // 默认选项
    $.fn.jqRating.options = {
        url: '',  //提交评分的地址
        iconPath: 'resources/img/rating.png',  //图片地址
        average: 0,  //平均评分数
        maxRate: 5,  //默认最大分数
        length: 5,  //默认星星个数
        decimal: 0,  //精度
        disabled: false,  // 禁用
        starInfo: {  //评分星星信息
            width: 0,
            height: 0,
            image: ''
        }
    };
})(jQuery);