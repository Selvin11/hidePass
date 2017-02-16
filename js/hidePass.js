/**
 * original input 
 * clone input
 * original input password  => clone input blackDot
 */

$.fn.hidePass = function(options) {
    var defaults = {
        'checkInterval': 200,
        'blackDotDelay': 500,
        //黑点Unicode编码
        'blackDotChar': '\u25CF'
    };
    // 增加插件参数配置
    var settings = $.extend(defaults, options);
    var checkTimeout = [];
    var maskTimeout = [];
    // regex  => /[^●]/gi
    var regex = new RegExp('[^' + settings['blackDotChar'] + ']', 'gi');
    var i = 0;
    return this.each(function(index) {
        // 方便更改克隆后的input相关属性
        var suffix = '-' + index,
            original = $(this),
            id = this.id,
            name = this.name,
            newId = id + suffix,
            newName = id + suffix;
        if (!id || !name) {
            alert("You must set 'id' and 'name' attributes for elements!");
            return false;
        }
        //克隆input存放黑点
        var newInput = original.clone();
        newInput.attr({
            'id': newId,
            'name': newName
        }).insertAfter(original);
        for (var k in this) {
            // console.log(k)
            if (this[k]) {
                newInput[k] = this[k];
            }
        }
        //隐藏存储真实表单数据的input
        original.hide();
        newInput.bind('focus', function() {
            //首先将输入input的原始值赋给隐藏的原input
            var oldValue = newInput.val();
            //定时检查输入值
            checkTimeout[index] = setTimeout(function() {
                //检查当前输入框中的值的改变
                checkChange(index, id, newId, oldValue)
            }, settings['checkInterval'])
        });
        newInput.bind('blur', function() {
            //使字符变为黑点
            setBlackDot(index, newId);
            //清除定时器
            clearTimeout(checkTimeout[index])
        });
    });

    // 原始input已经隐藏，现在只有clone之后的input
    function checkChange(index, oldId, newId, oldValue) {
        var curValue = $('#' + newId).val();
        if (curValue != oldValue) {
            // 使得当前输入的字符在显示一段时间后变为黑点
            setPass(index, oldId, newId);
        } else {
            //使输入框的值变成黑点
            setBlackDot(index, newId);
        }
        oldValue = curValue;
        //继续定时检查
        checkTimeout[index] = setTimeout(function() {
            checkChange(index, oldId, newId, oldValue)
        }, settings['checkInterval'])
    }

    function setPass(index, oldId, newId) {
        var pos = getCurPos(newId);
        var lastInputChar;
        // 当前的input
        var inpObj = $('#' + newId);
        // 隐藏的input
        var passObj = $('#' + oldId);
        var inputChars = inpObj.val().split('');
        var passChars = passObj.val().split('');
        if (maskTimeout[index]) {
            clearTimeout(maskTimeout[index]);
            maskTimeout[index] = null;
        }
        for (i = 0; i < inputChars.length; i++) {
            if (inputChars[i] != passChars[i]) {
                if (inputChars[i] != unescape(settings['blackDotChar'])) {
                    passChars.splice(i, 0, inputChars[i])
                } else {
                    passChars[i] = passChars[i]
                }
            } else {
                passChars.splice(i, 0, inputChars[i])
            }
        }
        if (inputChars.length < passChars.length) {
            passChars.splice(pos.start, passChars.length - inputChars.length, '')
        }
        for (i = 0; i < inputChars.length; i++) {
            if (inputChars[i] != unescape(settings['blackDotChar'])) {
                lastInputChar = i;
            }
        }
        for (i = 0; i < inputChars.length; i++) {
            if (i < lastInputChar) {
                inputChars[i] = unescape(settings['blackDotChar'])
            }
        }
        inpObj.val(inputChars.join(''));
        passObj.val(passChars.join(''));
        //设置光标位置
        setCurPos(newId, pos);
    };

    function setBlackDot(index, newId) {
        // 获取光标当前位置
        var pos = getCurPos(newId);
        var inpObj = $('#' + newId);
        var curValue = inpObj.val();
        if (!maskTimeout[index] && curValue.match(regex) != null) {
            maskTimeout[index] = setTimeout(function() {
                inpObj.val(curValue.replace(regex, unescape(settings['blackDotChar'])));
                setCurPos(newId, pos)
            }, settings['blackDotDelay'])
        }
    };

    function getCurPos(newId) {
        var input = $('#' + newId)[0];
        var pos = {
            start: 0,
            end: 0
        };
        if (input.setSelectionRange) {
            pos.start = input.selectionStart;
            pos.end = input.selectionEnd
        } else if (input.createTextRange) {
            var bookmark = document.selection.createRange().getBookmark();
            var selection = input.createTextRange();
            var before = selection.duplicate();
            selection.moveToBookmark(bookmark);
            before.setEndPoint('EndToStart', selection);
            pos.start = before.text.length;
            pos.end = pos.start + selection.text.length
        }
        return pos;
    };

    function setCurPos(newId, pos) {
        var input = $('#' + newId)[0];
        if (input.setSelectionRange) {
            input.setSelectionRange(pos.start, pos.end)
        } else if (input.createTextRange) {
            var selection = input.createTextRange();
            selection.collapse(true);
            selection.moveEnd('character', pos.end);
            selection.moveStart('character', pos.start);
            selection.select();
        }
    }
}