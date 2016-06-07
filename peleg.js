+function (w, d) {

  'use strict';

  var LINEBREAK = '<br/>';
  var EMPTYFUNC = new Function;

  var keyMap = {
    37: EMPTYFUNC,
    38: historyLast,
    39: EMPTYFUNC,
    40: historyNext,
    13: executeCommand,
    9: insertBestMatch
  };

  var history = [];
  var historyPointer = 0;

  var projects = [{
    name: 'Burns Film Center - Education',
    url: 'https://education.burnsfilmcenter.org',
    description: 'Freelance Project - Education branch of the Jacob Burns Film Center.'
  }, {
    name: 'Artsicle',
    url: 'https://artsicle.com',
    description: 'Previous Workplace - Mapping the world\'s artists.'
  }, {
    name: 'Teachers Pay Teachers',
    url: 'https://www.teacherspayteachers.com',
    description: 'Current Workplace - An educators\' marketplace.'
  }, {
    name: 'Ugh, Code',
    url: 'http://www.amazon.com/Ugh-Code-Introduction-Programming-Slightly/dp/1533278105',
    description: 'Introductory programming book.'
  }, {
    name: 'Komnt',
    url: 'https://chrome.google.com/webstore/detail/komnt/ocopajchgbhmlkcfbppfiegapgjneppa',
    description: 'Chrome extension to annotate the web.'
  }];

  var globalCommands = {

    commands: {
      header: 'Available Commands',
      func: function () {
        return Object.keys(globalCommands).sort().join(LINEBREAK);
      }
    },

    contact: {
      header: 'Contact Info',
      func: function () {
        customInput('', {
          y: function () {
            w.open('mailto:peleg3@gmail.com', '_blank');
          },
          n: EMPTYFUNC
        });
        return [
          'Peleg Rosenthal',
          'Software Engineer',
          'peleg3@gmail.com',
          'Brooklyn, NY'
        ].join(LINEBREAK) + LINEBREAK + 'Send Email? (y/n)';
      }
    },

    clear: {
      func: function () {
        return outputEl.innerHTML = '';
      }
    },

    linkedin: {
      func: function () {
        customInput('Open LinkedIn profile? (y/n)', {
          y: function () {
            w.open('http://www.linkedin.com/pub/peleg-rosenthal/30/705/757', '_blank');
          },
          n: EMPTYFUNC
        })
      }
    },

    github: {
      func: function () {
        customInput('Open Github profile? (y/n)', {
          y: function () {
            w.open('http://www.github.com/peleg', '_blank');
          },
          n: EMPTYFUNC
        })
      }
    },

    about: {
      header: 'About Me',
      func: function () {
        return '\
          An Israeli native with an ongoing love for making things simpler \
          through reducing unneeded processes. This includes using hand soap \
          as an all-purpose cleaner, or simply helping the team at Artsicle \
          connect the entire world\'s artists.';
      }
    },

    resume: {
      func: function () {
        customInput('Download a copy? (y/n)', {
          y: function () {
            w.open('/PelegRosenthal.pdf', '_blank');
          },
          n: EMPTYFUNC
        });
      }
    },

    work: {
      header: 'Work',
      func: function () {
        customInput('', {
          open: function(i, project) {
            if (project = projects[i - 1])
              w.open(project.url, '_blank');
          }
        });
        return projects.reduce(function (carry, project, i) {
          return carry +
            '<p>' +
              (i + 1) + '. ' + project.name + ' - ' + project.description +
            '</p>';
        }, '') + LINEBREAK + 'Type "open &lt;number&gt;" to open in new tab';
      }
    },

    song: {
      func: function () {
        if (!songEl.innerHTML.length) {
          output('Loading...');
          var iframe = d.createElement('iframe');
          iframe.src = "http://www.youtube.com/embed/8m5C_1bW5Ec?autoplay=1";
          iframe.style.display = 'none';
          iframe.onload = function() {
            output('Playing: Lord Echo - Thinking of You');
          };
          songEl.appendChild(iframe);
        }
        customInput('Type "stop" to abort.', {
          stop: function () {
            songEl.innerHTML = '';
          }
        });
      }
    }
  };

  var inputEl, outputEl, songEl;

  w.onload = function init () {
    inputEl  = d.getElementById('inputField');
    outputEl = d.getElementById('outputField');
    songEl   = d.getElementById('songField');

    d.onkeydown = keyDownHandler;
    d.onclick = focusInputEl;
    inputEl.onkeyup = keyUpHandler;
    inputEl.onmousedown = mouseDownHandler;

    output('<p class="old">> Welcome! My name is Peleg.</p>');
    focusInputEl();
  };

  function keyDownHandler (e, func) {
    if (typeof (func = keyMap[e.keyCode]) === 'function') {
      e.preventDefault();
      func();
    }
  }

  /**
   * chrome for android does not give correct keycodes
   */
  function keyUpHandler(e) {
    if (/\n/.test(inputField.textContent)) {
      e.preventDefault();
      keyMap[13]();
    }
  }

  function mouseDownHandler (e) {
    return e.preventDefault();
  }

  function caretToEnd () {
    if (w.getSelection && d.createRange) {
      var e = d.createRange()
        , t = w.getSelection();
      e.selectNodeContents(inputEl);
      e.collapse(false);
      t.removeAllRanges();
      t.addRange(e);
    } else if (d.body.createTextRange) {
      var n = d.body.createTextRange();
      n.moveToElementText(inputEl);
      n.collapse(false);
      n.select();
    }
  }

  function focusInputEl () {
    inputEl.focus();
    caretToEnd();
  }

  function insertInput (txt) {
    inputEl.innerHTML = txt;
    caretToEnd();
  }

  function readInput () {
    return inputEl.innerHTML.toLowerCase().trim();
  }

  function executeCommand (commandSet) {
    commandSet || (commandSet = globalCommands);
    var parts = readInput().split(' '), txt = '', command, header;
    if (command = commandSet[parts[0]]) {
      if (header = command.header)
        txt += header + LINEBREAK + Array(header.length + 1).join('-') + LINEBREAK;
      var func = typeof command === 'function' ? command : command.func;
      txt += func.apply(this, parts.slice(1)) || '';
      history.push(parts.join(' '));
      historyPointer = history.length;
    } else {
      txt = 'Unknown command. Type "commands" for a list of available commands.';
    }
    output(txt);
  }

  function customInput (txt, options) {
    output(txt);
    // overwrite execute command to include custom options
    keyMap[13] = function () {
      keyMap[13] = executeCommand; // reinstate
      executeCommand(Object.assign({}, globalCommands, options));
    };
  }

  function output (txt) {
    var input = readInput();

    if (input.length)
      outputEl.innerHTML += '<p class="old"> > ' + input + '</p>';

    outputEl.innerHTML += '<p>' + txt + '</p>';
    outputEl.scrollTop = outputEl.scrollHeight;
    insertInput('');
  }

  function insertBestMatch () {
    var inputRegex = new RegExp(readInput());
    var commands = Object.keys(globalCommands).filter(function (command) {
      return inputRegex.test(command);
    });

    if (commands.length === 1)
      insertInput(commands[0]);
  }

  function historyLast () {
    if (historyPointer > 0) {
      var command = history[--historyPointer];
      insertInput(command);
    }
  }

  function historyNext () {
    if (historyPointer < history.length) {
      var command = history[++historyPointer] || '';
      insertInput(command);
    }
  }

}(window, document);
