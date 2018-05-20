let QQmusic = (function () {
    let $play = $('.icon-play'),
        $wrapper = $('.wrapper'),
        $header = $('header'),
        $footer = $('footer'),
        $section = $('section'),
        musicAudio = $('#musicAudio')[0],
        $currentTime = $('.currentTime'),
        $duration = $('.duration'),
        preIndex = 0,
        count = 0,
        midInner = $('.mid-inner')[0],
        $p = null;

    let contentHeight = function () {
        let winH = document.documentElement.clientHeight,
            font = parseFloat(document.documentElement.style.fontSize),
            contentH = winH - $header[0].offsetHeight - $footer[0].offsetHeight;
        $section.css({
            height: contentH - .8 * font
        })
    };
    let queryData = function () {
        return new Promise(resolve => {
            let xhr = new XMLHttpRequest();
            xhr.open('get', 'json/lyric.json');
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    resolve(data)
                }
            };
            xhr.send(null);
        })
    };
    let bindData = function (data) {
        data = data['lyric'];
        data = data.replace(/&#(\d+);/g, (a, b) => {
            switch (b) {
                case '32':
                    a = ' ';
                    break;
                case '40':
                    a = '(';
                    break;
                case '41':
                    a = ')';
                    break;
                case '45':
                    a = '-';
                    break;
            }
            return a
        });
        let lyricAry = [];
        reg = /\[(\d+)&#58;(\d+)&#46;\d+\]([^&#]+)(?:&#10;)?/g;
        data.replace(reg, (...arg) => {
            let [, minute, second, text] = arg;
            lyricAry.push({minute, second, text})
        });
        let str = ``;
        lyricAry.forEach(item => {
            str += `<p data-minute="${item.minute}" data-second="${item.second}">${item.text}</p>`
        });
        $wrapper.html(str);
        $p = $wrapper.find('p');
    };
    let playMusic = function () {
        musicAudio.play();
        musicAudio.addEventListener('canplay', $plan.fire);
    };

    let $plan = $.Callbacks();
    $plan.add(() => {
        $play.css('display', 'block').addClass('active');
        $play.tap(() => {
            if (musicAudio.paused) {
                musicAudio.play();
                $play.addClass('active');
                return
            }
            musicAudio.pause();
            $play.removeClass('active');
        })
    });
    let autoTimer = null;
    $plan.add(() => {
        let duration = musicAudio.duration;
        $duration.text(timeMove(duration));
        autoTimer = setInterval(() => {
            let {duration, currentTime} = musicAudio;
            long = currentTime / duration * 100;
            midInner.style.width = long + '%';
            $currentTime.text(timeMove(currentTime));
            lyricMove(currentTime);
            if (currentTime >= duration) {
                clearInterval(autoTimer);
                musicAudio.pause();
                $play.removeClass('active');
                $duration.text(timeMove(duration));
                midInner.style.width = '100%';
            }
        }, 1000);

        function timeMove(time) {
            let minute = Math.floor(time / 60);
            second = Math.floor(time % 60);
            minute < 10 ? minute = '0' + minute : null;
            second < 10 ? second = '0' + second : null;
            return minute + ':' + second
        }
    });
    let lyricMove = function (currentTime) {
        let pHeight = $p[0].offsetHeight;
        $p.each((index, item) => {
            let num = item.getAttribute('data-minute') * 60 + item.getAttribute('data-second') * 1;

            if (num === Math.round(currentTime)) {
                $p.eq(preIndex).removeClass('select');
                $(item).addClass('select');
                preIndex = index;
                if (index > 4) {
                    count += pHeight;
                    $wrapper.css('marginTop', -count)
                }
            }
        })
    };

    return {
        init: function () {
            contentHeight();
            let promise = queryData();
            promise.then((data) => {
                bindData(data);
                playMusic();
            })
        }
    }
})();
QQmusic.init();