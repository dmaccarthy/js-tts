function qsArgs(key, str) {
    // Parse query-string formatted data
    if (str == null) str = location.search;
    let args = {};
    try {
        for (let [k, val] of new URLSearchParams(str))
            args[k.trim()] = val;       
    } catch(err) {
        console.error(err);
        let qs = str.split("?")[1];
        if (qs == null) return key ? null : {};
        qs = qs.split("&");
        for (let i=0;i<qs.length;i++) {
            let a = qs[i].split("=");
            args[a[0].trim()] = decodeURIComponent(a[1]);
        }
    }
    return key ? args[key] : args;
}

function init() {
    let voices = speechSynthesis.getVoices();
    if (voices.length == 0) setTimeout(init, 100);
    else {
        init.voices = voices;
        init.voiceRow();
        $("#Buttons").show();
        let w = () => {
            $("textarea").css({visibility: "visible"}).width($("table").width() - 6);
        };
        w();
        setTimeout(w, 1500);
    }
}

init.selectVoice = () => {
    // Generate a <select> element containing available voices
    let s = $("<select>");
    let opt = s[0].options;
    opt.length = init.voices.length;
    for (let i=0;i<opt.length;i++) opt[i].innerHTML = init.voices[i].name;
    s[0].selectedIndex = 0;
    return s;
}

init.voiceRow = () => {
    // Append a new row to the voice list
    let tr = $("<tr>").addClass("Voice");
    let a = {contenteditable: "true"};
    tr.append($("<td>").html($("#Voices > tr.Voice").length));
    tr.append($("<td>").html(init.selectVoice()));
    tr.append($("<td>").attr(a).html(1));
    tr.append($("<td>").attr(a).html(1)).appendTo("#Voices");
    tr.append($("<td>").attr(a).html(1));
}

$(() => {
    play.queue = [];
    init();
    console.log(`json(replacer, space);
batch(url_array);
batch.fromFolder("p30/", url_array);
$.getScript("p30/test.js");`);
});

function say(text, v, cb) {
    // Speak one utterance
    let u = new SpeechSynthesisUtterance(text);
    Object.assign(u, {rate: 1, lang: "en-CA"});
    v = say.voice(v ? v : 0);
    Object.assign(u, v);
    if (cb) u.onend = cb;
    console.log(`${v.voice.name}:\n\t${text}`);
    speechSynthesis.speak(u);
}

say.voice = (n) => {
    // Get voice, pitch, and rate
    let tr = $("#Voices > tr");
    let j = 0;
    for (let i=0;i<tr.length;i++) {
        let v = $($(tr[i]).children("td")[0]).text();
        v = parseInt(v);
        if (v == n) j = i;
    }
    tr = $(tr[j]);
    let td = tr.children("td");
    let v = $(td[1]).find("select")[0];
    return {
        voice: init.voices[v.selectedIndex],
        pitch: parseFloat($(td[2]).text()),
        rate: parseFloat($(td[3]).text()),
        volume: parseFloat($(td[4]).text())
    };
}

function play(queue) {
    // Play the specified queue
    clearTimeout(play.timeout);
    if (queue == null) queue = play.queue.slice();
    if (queue.length == 0 || play.timeout === false) {
        delete play.timeout;
        console.log("Done!");
        return;
    }
    let [text, voice, delay] = queue[0];
    queue.splice(0, 1);
    play.timeout = setTimeout(() => {
        say(text, voice, () => play(queue));
    }, 1000 * delay);
}

function loadFile() {
    let e = $("#File");
    let f = e[0].files[0];
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
        let q = loadFile.convert(reader.result);
        if (q) {
            $("textarea").val(reader.result);
            play.queue = q;
            // lines();
        }
    });
    reader.readAsText(f); 
    e.val("");
}

function loadText() {
    let q = loadFile.convert($("textarea").val());
    if (q) {
        play.queue = q;
        lines();
    }
}

loadFile.voices = (v) => {
    let n = v.length;
    for (i = n - $("#Voices > tr").length; i > 0; i--) init.voiceRow();
    let tr = $("#Voices > tr");
    for (let i=0;i<v.length;i++) {
        let td = $(tr[i]).children("td");
        let vi = v[i];
        let namelist = vi[0].toLowerCase().split(";");
        let sel = $(td[1]).find("select")[0];
        for (let k=0;k<namelist.length;k++) {
            for (let j=0;j<sel.options.length;j++) {
                let name = sel.options[j].innerHTML.toLowerCase();
                if (name.search(namelist[k].trim()) > -1) {
                    sel.selectedIndex = j;
                    j = sel.options.length;
                    k = namelist.length;
                }
            }
        }
        for (let j=1;j<4;j++) $(td[j+1]).html(vi[j]);
    }
}

loadFile.convert = (text) => {
    let queue = [];
    try {
        queue = JSON.parse(text);
        if (queue.cast) {
            loadFile.voices(queue.cast);
            return;
        }
    }
    catch(err) {
        let q = text.replaceAll("\r\n", "\n").replaceAll("\n\r", "\n").replaceAll("\r", "").split("\n");
        let delay = 0, voice = 0, auto = 0;
        for (let i=0;i<q.length;i++) {
            let line = q[i].split("##")[0].trim();
            if (line.length) {
                if (line.substring(0, 2) == "!!") {
                    let cmd = qsArgs(null, line.substring(2));
                    if (cmd.v != null) voice = parseInt(cmd.v);
                    if (cmd.a != null) delay = auto = parseFloat(cmd.a);
                    if (cmd.d != null) delay = parseFloat(cmd.d);
                }
                else {
                    queue.push(delay ? [line, voice, delay] : [line, voice]);
                    delay = auto;
                }
            }
        }
    }
    return queue;
}

function _batch(n, urls) {
    if (n < urls.length) $.ajax({url: urls[n], success: (data, status, rq) => {
            let queue = loadFile.convert(data);
            play.queue = play.queue.concat(queue);
            _batch(n + 1, urls);
        }});
    else {
		lines();
		if (batch.callback) batch.callback();
	}
}

function batch(urls) {
	play.queue = [];
    _batch(0, urls);
}

batch.callback = play;

batch.fromFolder = (fldr, urls) => {
    let u = [], n = urls.length;
    for (let i=0;i<n;i++) u.push(fldr + urls[i]);
    batch(u);
	return `Sending ${n} requests...`;
}

play.stop = () => {
    // Stop the current playback
    clearTimeout(play.timeout);
    play.timeout = false;
}

play.save = (fn) => {
    let blob = new Blob([$("textarea").val()], {type: "text/plain"});
    let url = URL.createObjectURL(blob);
    if (fn === true) {
        fn = new Date().toString().substring(4, 24);
        fn = fn.replaceAll(":", "").replaceAll(" ", "");
        fn = fn.toLowerCase() + ".txt";
    }
    let a = $("<a>").attr({href: url, download: fn});
    if (fn == null) a.attr({target: "js-tts-text"});
    a[0].click();
}

function lines() {console.log(`${play.queue.length} lines`)}
function json(r, s) {console.log(JSON.stringify(play.queue, r, s))}
