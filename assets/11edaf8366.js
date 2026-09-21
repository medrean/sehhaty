var g_stopWatch, g_TimeOutMin = 10;
var g_utterance = "";
var g_attachmentMode = 0;
var g_MaskedInput = false;
var g_DomainTrackURL = "alkhwarizmi.chat";
var g_transport = { transport: ['webSockets', 'serverSentEvents', 'foreverFrame', 'longPolling'] };
//var g_transport= { transport: ['serverSentEvents', 'foreverFrame', 'longPolling'] };
//var g_transport= { transport: ['longPolling'] };
var g_webviewMode = "0";
var g_angularMode = "0";
var g_liveChatMode = "KHWARIZMI";//"GENESYS-CONNECT"
var g_livechatId = "";

function encryptUtterance(utterance) {
    var publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8Ywd5XN/TA4qFL1vIt+vcpWnc
+5dttwXa+EVAzCQEapN8uwEm5dg8+hu122n/haeqct+WKWymrBEt3FCL/3sjj3h4
OVqk+TTOlFrhBv8fjr8kGVwHJY+6d0PvTov5siJEtO6Zx721LZkLCkRayNSBx7/g
n+MGWmZKV9nPgrTM3QIDAQAB
-----END PUBLIC KEY-----`;
    // we create a new JSEncrypt object for rsa encryption
    var rsaEncrypt = new JSEncrypt();
    // we set the public key (which we passed into the function)
    rsaEncrypt.setPublicKey(publicKey);  // now we encrypt the key & iv with our public key
    var encryptedKey = rsaEncrypt.encrypt(utterance)
    return encryptedKey;
}

function scrollImg() {
    /* var mainContainer = document.getElementById('conversation');
     var elem = document.getElementById('msg_block');
     var newContentSize = elem.scrollHeight -g_prvscrollHeight;
 
     if (newContentSize > (mainContainer.clientHeight-110))
     {
         mainContainer.scrollTop =  mainContainer.scrollHeight - newContentSize-110;
     }
     else
         mainContainer.scrollTop = mainContainer.scrollHeight - newContentSize;
 
     g_prvscrollHeight = elem.scrollHeight;*/
    setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 400);
}


function stopWatch(duration, display, callBack) {
    var timer = duration, minutes, seconds;
    g_stopWatch = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            callBack();
        }
    }, 1000);
}

function setCookie(cname, cvalue, seconds) {
    var d = new Date();
    d.setTime(d.getTime() + (seconds * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=None; Secure";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function eraseCookie(cname) {
    document.cookie = cname + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function setStorageKeyValue(key, value) {
    if (window.localStorage == 'undefined')
        return false;

    window.localStorage.setItem(key, value);
}
function getStorageKeyValue(key) {

    if (window.localStorage == 'undefined')
        return false;

    return window.localStorage.getItem(key);
}
function deleteStorageKeyValue(key) {
    if (window.localStorage == 'undefined')
        return false;

    window.localStorage.removeItem(key);
}
function setStorageKeyObject(key, obj) {

    if (window.localStorage == 'undefined')
        return false;

    window.localStorage.setItem(key, JSON.stringify(obj));
}
function getStorageKeyObject(key) {

    if (window.localStorage == 'undefined')
        return false;

    return JSON.parse(window.localStorage.getItem(key));
}

function setTimeStampStorageKey(key, mode) {

    try {
        if (window.localStorage == 'undefined')
            return false;
    } catch (e) {
        return false;
    }

    if (mode)
        window.localStorage.setItem(key, new Date().getTime());
    else
        window.localStorage.removeItem(key);
}
function getTimeStampStorageKey(key) {

    try {
        if (window.localStorage == 'undefined')
            return false;
    } catch (e) {
        return false;
    }

    var date = window.localStorage.getItem(key)

    if (date == null)
        return false;

    //var connected = JSON.parse(key);
    var now = new Date().getTime();

    var diff = Math.abs(now - date) / 1000;

    if (diff > 120) {
        window.localStorage.removeItem(key);
        return false;
    }

    return true;
}

function setStorageWithExpiration(key, value, expirationMinutes) {
    const currentTime = new Date().getTime();
    const expirationTime = currentTime + expirationMinutes * 60 * 1000; // Convert minutes to milliseconds
    const data = {
        value: value,
        expirationTime: expirationTime
    };
    localStorage.setItem(key, JSON.stringify(data));
}

function getStorageWithExpiration(key) {
    const storedData = localStorage.getItem(key);
    if (!storedData) {
        return null;
    }

    const data = JSON.parse(storedData);
    const currentTime = new Date().getTime();

    if (currentTime > data.expirationTime) {
        // Data has expired, remove it
        localStorage.removeItem(key);
        return null;
    }

    return data.value;
}

(function (window) {
    function alkhwaizmiBots() {
        // 'use strict';
        // This variable will be inaccessible to the user, only can be visible in the scope of alkhwaizmiBots library.

        var WelcomeApi = "/api/bot/Start";
        var GetResponseApi = "/api/bot/Ask";
        var logoutApi = "/api/bot/Logout";
        var EndSessionApi = "/api/bot/End";
        var TrackURLApi = "/api/bot/GetUrlResponse";
        var fireIntentApi = "/api/bot/FireIntent";
        var CSSurveyApi = "/api/bot/TriggerCsSurvey";
        var NotifySessionApi = "/api/bot/NotifyCsSurvey";
        var saveConversationApi = "/api/bot/save/";

        var GetDepartmentApi = "/Department/GetChatbotDepartments/";
        var UpdateUserLogApi = "/Widget/UpdateUserLog/";

        var SignalrURL = "https://livechat.alkhwarizmi.chat/clientsHub";

        var clientHub = undefined;
        var g_webUrl = "";
        var g_UrlTimerTrigger;
        var alawwalUser = "";

        var self = {
            projectId: "", livechatId: "", userId: "", sessionId: "", encrypt: false, connectedWithHub: false, welcome: false, targetDepartment: "default",
            connectionMode: "bot", connectedAgentId: undefined, reConnect: false, _events: {}, currentUtteranceWelcome: false, loggedSession: false

        };


        //debugger;
        self.init = function (uId, pId, livechatId, authToken) {

            self.userId = uId;
            self.projectId = pId;
            if (livechatId == "")
                self.livechatId = pId;
            else
                self.livechatId = livechatId;
            self.authToken = authToken;

            self.lang = "ar";
            self.param = null;
            self.paramUsed = false;

            //var param =  getCookie("botParam");
            var param = getStorageWithExpiration("botParam");
            if (param1 = null && param != "")
                self.param = param;

            //var sessionInfo =  getCookie("sessionInfo");
            var sessionInfo = getStorageWithExpiration("sessionInfo");
            if (sessionInfo != null && sessionInfo != "") {
                sessionInfo = JSON.parse(sessionInfo);
                if (sessionInfo.botId == self.projectId) {
                    self.sessionId = sessionInfo.sessionId;
                    //setCookie("sessionInfo",JSON.stringify(sessionInfo),g_TimeOutMin*60);
                    setStorageWithExpiration("sessionInfo", JSON.stringify(sessionInfo), g_TimeOutMin * 60);
                }
            }

            var ConnectedState = getTimeStampStorageKey('connected');
            var requestAgent = getTimeStampStorageKey('requestAgent');

            if (ConnectedState || requestAgent) {
                self.reConnect = true;
                handleLiveChat(self.reConnect, "ar");
            }

        }
        self.sendAjaxCall = function (url, data, type, reConnect) {
            $.ajax
                ({
                    type: "POST",
                    url: url,
                    dataType: 'json',
                    contentType: 'application/json',
                    headers: { "X-Auth": self.authToken },
                    data: data,
                    success: function (response) {

                        if (type == 4) {
                            self._invokeEventCallbacks('handle-tracked-url', response);
                        }
                        else {
                            if (self.currentUtteranceWelcome) {
                                if (response.indexOf("SYS_BUSY") == -1)
                                    self.welcome = true;

                                self.currentUtteranceWelcome = false;
                            }
                            if (self.paramUsed) {
                                self.param = null;
                                eraseCookie("botParam");
                            }

                            self._invokeEventCallbacks('handle-reponse', response, reConnect);
                        }
                    },
                    fail: function () {
                        self._invokeEventCallbacks('net-connection-error');
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        if (XMLHttpRequest.readyState == 4) {
                            // HTTP error (can be checked by XMLHttpRequest.status and XMLHttpRequest.statusText)
                        }
                        else if (XMLHttpRequest.readyState == 0) {
                            // Network error (i.e. connection refused, access denied due to CORS, etc.)
                        }
                        else {
                            // something weird is happening
                        }

                        self._invokeEventCallbacks('net-connection-error');
                    }

                });
        }
        self.sendMessage = function (utterance) {
            routeUtterance(utterance, false);

        }


        self.trackURL = function (url) {
            g_webUrl = url;
            clearTimeout(g_UrlTimerTrigger);
            g_UrlTimerTrigger = setTimeout(getURLIntent, 5000);
        }

        self.fireIntent = function (intent) {
            fireBotIntent(intent);
        }

        self.liveChat = function (state, attachedVariables) {

            if (attachedVariables != null && attachedVariables.length > 0) {
                self.department = attachedVariables[0];
                //self.clientName ="";
                if (attachedVariables.length > 1) {
                    if (attachedVariables[1].clientInfo != null) {
                        //self.clientName = 
                        self.clientInfo = attachedVariables[1].clientInfo;
                    }
                } else {
                    self.clientInfo = null;
                }
                /*for (var i = 1; i < attachedVariables.length;i++ )
                {
                    if (attachedVariables[i].userName != null)
                    {
                        //self.clientName = 
                        self.clientName = attachedVariables[i].userName;
                    }
                    else if (attachedVariables[i].logged != null)
                    {
                        self.clientLogged = attachedVariables[i].logged;
                    }

                }*/
            }

            handleLiveChat(false);
        }

        self.setEncrypt = function (encrypt) {
            self.encrypt = encrypt;
        }

        self.setLang = function (lang) {
            self.lang = lang;
        }
        self.setParameter = function (param) {
            self.param = param;
            self.paramUsed = false;
            var obj = JSON.parse(self.param);
            if (obj.sys_userId != null) {
                obj.sys_userId = encryptUtterance(obj.sys_userId);
                self.param = JSON.stringify(obj);
            }
            //setCookie("botParam",param,g_TimeOutMin*60);
            setStorageWithExpiration("botParam", param, g_TimeOutMin * 60);
        }
        self.setSessionId = function (sessionId) {
            self.sessionId = sessionId;
        }

        self.logout = function () {
            logout();
        }
        self.endSession = function () {
            endSession();
        }


        self.getAlawwalUser = function () {
            return alawwalUser;
        }

        self.callWelcome = function (reConnect) {
            if (!self.welcome) {
                self.currentUtteranceWelcome = true;
                $("#msg_input").prop("disabled", true);
                //routeUtterance("Welcome",reConnect);
                startConversation(reConnect);
                updateUserLog();
                //self.welcome = true;
            }
        }

        self.connectWithAgent = function (departmentId, departmentName) {

            self.targetDepartment = { id: departmentId, name: departmentName };
            setStorageKeyObject('client-department', self.targetDepartment);
            self.connectionMode = "waiting";
            // establish hub connection
            if (self.connectedWithHub)
                clientHub.invoke("connect", self.userId, self.targetDepartment, self.clientInfo, self.livechatId, self.projectId, self.lang);
        }

        self.closeCSConversation = function () {
            if (self.connectedWithHub) {
                if (g_liveChatMode == "KHWARIZMI")
                    clientHub.invoke("closeRoom", self.userId, self.projectId, self.livechatId);
                else
                    window.externalLiveChat.endChat(self.lang);

            }
        }
        self.sendMediaToAgent = function (mediaUrl) {
            if (self.connectedAgentId) {

                clientHub.invoke("sendAttachment", self.userId, "", mediaUrl, self.projectId, self.livechatId);
            }
        }
        self.on = function (eventType, cb) {
            this._addEventCallback(eventType, cb);
        };

        // Append the new callback to our list of event handlers.
        self._addEventCallback = function (eventId, callback) {
            this._events[eventId] = this._events[eventId] || [];
            this._events[eventId].push(callback);
        };
        // Retrieve the list of event handlers for a given event id.
        self._getEventCallbacks = function (eventId) {
            if (this._events.hasOwnProperty(eventId)) {
                return this._events[eventId];
            }
            return [];
        };
        // Invoke each of the event handlers for a given event id with specified data.
        self._invokeEventCallbacks = function (eventId) {
            var args = [],
                callbacks = this._getEventCallbacks(eventId);

            Array.prototype.push.apply(args, arguments);
            args = args.slice(1);

            for (var i = 0; i < callbacks.length; i += 1) {
                callbacks[i].apply(null, args);
            }
        };
        //_______________out of Scope Functions__________________//
        function sendToAgent(message) {
            if (self.connectedAgentId) {
                if (g_liveChatMode == "KHWARIZMI")
                    clientHub.invoke("send", self.userId, message, self.projectId, self.livechatId);
                else
                    window.externalLiveChat.sendMessage(message);

            }
        }
        function writeToLogs(message) {
            clientHub.invoke("writeLogs", self.userId, message, "", self.projectId);
        }


        function updateUserLog() {
            $.post(UpdateUserLogApi, { userId: self.userId, chatbotId: self.projectId }, function (response) {
                if (response.status == 1) {
                }
                else {
                }
            }).fail(function () {
            });
        }


        function handleLiveChat(reconnect) {

            if (g_liveChatMode == "KHWARIZMI")
                alkhwarizmiLiveChat(reconnect);
            else
                externalLiveChat(reconnect);
        }

        function externalLiveChat(reconnect) {


            window.externalLiveChat.requestAccepted = function (participantID, chatID) {
                self.connectedWithHub = true;
                setStorageKeyObject('livechat-connection', { participantID: participantID, chatID: chatID });
                self._invokeEventCallbacks('agent-try-connect');
            }

            window.externalLiveChat.startRoom = function (agentId, message) {

                self.connectionMode = "agent";
                self.connectedAgentId = agentId;
                setTimeStampStorageKey('requestAgent', false);
                setTimeStampStorageKey('connected', true);

                self._invokeEventCallbacks('agent-connected');
                //sendMessageToParent("logout#$#hide");
                window.parent.postMessage("logout#$#hide", '*');

                if (!self.reConnect)
                    self._invokeEventCallbacks('start-room', message);
                else {
                    self.callWelcome(self.reConnect);
                    self.agentConncetionMessage = message;
                    self.reConnect = false;
                }
            }

            window.externalLiveChat.addNewMessage = function (message, mediaUrl) {
                self._invokeEventCallbacks('add-agent-message', message, mediaUrl);
            }

            window.externalLiveChat.setTypingMode = function (mode) {
                self._invokeEventCallbacks('set-agent-typing-mode', mode);
            }

            window.externalLiveChat.addToConversation = function (message) {
                var genesysConnection = getStorageKeyObject('livechat-connection');

                if (genesysConnection.messages == null)
                    genesysConnection.messages = [];

                genesysConnection.messages.push(message);

                setStorageKeyObject('livechat-connection', genesysConnection);

                var lang = "ar";
                $.ajax
                    ({
                        type: "POST",
                        url: saveConversationApi,
                        dataType: 'json',
                        /*username: username,
                        password: password,*/
                        contentType: 'application/json',
                        headers: { "X-Auth": self.authToken },
                        data: JSON.stringify({ botId: self.projectId, userId: self.userId, sessionId: self.sessionId, message: message.text, agentId: genesysConnection.participantID, chatId: genesysConnection.chatID, type: message.from.type, lang: lang, channel: "web" }),
                        success: function (response) {
                            if (self.currentUtteranceWelcome) {
                                if (response.indexOf("SYS_BUSY") == -1)
                                    self.welcome = true;

                                self.currentUtteranceWelcome = false;
                            }


                        },
                        fail: function () {
                            self._invokeEventCallbacks('net-connection-error');
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            if (XMLHttpRequest.readyState == 4) {
                                // HTTP error (can be checked by XMLHttpRequest.status and XMLHttpRequest.statusText)
                            }
                            else if (XMLHttpRequest.readyState == 0) {
                                // Network error (i.e. connection refused, access denied due to CORS, etc.)
                            }
                            else {
                                // something weird is happening
                            }

                            self._invokeEventCallbacks('net-connection-error');
                        }

                    });

            }

            function loadConversation() {
                var genesysConnection = getStorageKeyObject('livechat-connection');

            }

            window.externalLiveChat.roomClosed = function (message, chatId) {

                // $.connection.hub.stop();
                clientHub.stop()
                    .then(() => {
                        console.log("Connection stopped.");
                    })
                    .catch(err => {
                        console.error("Error while stopping connection: ", err);
                    });
                self.connectionMode = "bot";
                self.connectedWithHub = false;
                setTimeStampStorageKey('connected', false);
                setTimeStampStorageKey('requestAgent', false);
                self._invokeEventCallbacks('close-room', message);
                var param = "GenesysChatId" + "##" + chatId + "@@";

                self.sendAjaxCall(NotifySessionApi, JSON.stringify({ id: self.projectId, userId: self.userId, sessionId: self.sessionId, projectId: self.livechatId, channel: "web", message: "", param: param }), 3, false);

            }


            window.externalLiveChat.agentDisconnect = function (empId, message) {
                self.connectionMode = "waiting";
                //setTimeStampStorageKey('connected',false);
                self._invokeEventCallbacks('room-diconnect', message);
            }

            window.externalLiveChat.requestAdded = function requestAdded(message) {
                setTimeStampStorageKey('requestAgent', true);
                self._invokeEventCallbacks('request-added', message);
            }

            window.externalLiveChat.requestRejected = function requestRejected(message) {
                setTimeStampStorageKey('request-rejected', message);
                self._invokeEventCallbacks('request-rejected', message);
            }


            window.externalLiveChat.agentNotAvaliable = function (message) {
                self.connectionMode = "bot";
                self.connectedWithHub = false;
                setTimeStampStorageKey('requestAgent', false);
                self._invokeEventCallbacks('agent-not-avaliable', message);
            }

            if (!self.connectedWithHub) {
                if (reconnect) {
                    setTimeout(function () {
                        var livechatConnection = getStorageKeyObject('livechat-connection');
                        //self._invokeEventCallbacks('livechat-conversation',livechatConnection);
                        window.externalLiveChat.reconnect(livechatConnection);
                        self._invokeEventCallbacks('agent-connected');
                    }, 200);

                }
                else
                    window.externalLiveChat.startChat(self.userId, self.targetDepartment, self.department, self.projectId, self.lang);
            }

        }

        function alkhwarizmiLiveChat(reconnect) {
            //display response on screen
            // try to connect to Agent page
            //  clientHub = $.connection.clientsHub;

            clientHub = new signalR.HubConnectionBuilder()
                .withUrl(SignalrURL, { transport: signalR.HttpTransportType.WebSockets })// .WebSockets or .LongPolling, .ServerSentEvents
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // === SignalR connection lifecycle hooks ===
            clientHub.onreconnecting((err) => {
                console.warn('[HUB] Reconnecting...', err?.message);
            });
            clientHub.onreconnected((newConnectionId) => {
                var department = getStorageKeyObject('client-department');
                if (department != null)
                    self.targetDepartment = department;
                // establish hub connection
                clientHub.invoke("connect", self.userId, self.targetDepartment, self.clientInfo, self.livechatId, self.projectId, self.lang);
                self._invokeEventCallbacks('agent-try-connect');
                console.info('[HUB] Reconnected. New connectionId:', newConnectionId);
            });

            clientHub.on("addNewMessageToPage", function (name, message, mediaUrl) {
                self._invokeEventCallbacks('add-agent-message', message, mediaUrl);
            });

            clientHub.on("setTypingMode", function (name, mode) {
                self._invokeEventCallbacks('set-agent-typing-mode', mode);
            });

            clientHub.on("startRoom", function (agentId, message) {

                self.connectionMode = "agent";
                self.connectedAgentId = agentId;
                setTimeStampStorageKey('requestAgent', false);
                setTimeStampStorageKey('connected', true);
                self._invokeEventCallbacks('agent-connected');
                //sendMessageToParent("logout#$#hide");
                window.parent.postMessage("logout#$#hide", '*');
                if (!self.reConnect)
                    self._invokeEventCallbacks('start-room', message);
                else {
                    self.callWelcome(self.reConnect);
                    self.agentConncetionMessage = message;
                    self.reConnect = false;
                }
            });

            clientHub.on("roomClosed", function (message) {

                //  $.connection.hub.stop();
                clientHub.stop()
                    .then(() => {
                        console.log("Connection stopped.");
                    })
                    .catch(err => {
                        console.error("Error while stopping connection: ", err);
                    });
                self.connectionMode = "bot";
                self.connectedWithHub = false;
                setTimeStampStorageKey('connected', false);
                setTimeStampStorageKey('requestAgent', false);
                self._invokeEventCallbacks('close-room', message);

                self.sendAjaxCall(NotifySessionApi, JSON.stringify({ id: self.projectId, userId: self.userId, sessionId: self.sessionId, projectId: self.livechatId, channel: "web", message: "" }), 3, false);

            });

            clientHub.on("roomClosedAndRequestCreated", function (message) {
                self.connectionMode = "bot";
                setTimeStampStorageKey('connected', false);
                self._invokeEventCallbacks('close-new-request', message);
            });

            clientHub.on("agentDisconnect", function (empId, message) {
                self.connectionMode = "waiting";
                //setTimeStampStorageKey('connected',false);
                self._invokeEventCallbacks('room-diconnect', message);
            });

            clientHub.on("requestAdded", function (message) {
                setTimeStampStorageKey('requestAgent', true);
                self._invokeEventCallbacks('request-added', message);
            });
            clientHub.on("requestRejected", function (message) {
                setTimeStampStorageKey('request-rejected', message);
                self._invokeEventCallbacks('request-rejected', message);
            });

            clientHub.on("requestClosed", function (message) {
                setTimeStampStorageKey('request-closed', message);
                self._invokeEventCallbacks('request-closed', message);
            });


            clientHub.on("agentNotAvaliable", function (message) {
                // $.connection.hub.stop();
                clientHub.stop()
                    .then(() => {
                        console.log("Connection stopped.");
                    })
                    .catch(err => {
                        console.error("Error while stopping connection: ", err);
                    });

                self.connectionMode = "bot";
                self.connectedWithHub = false;
                setTimeStampStorageKey('requestAgent', false);
                self._invokeEventCallbacks('agent-not-avaliable', message);
            });

            if (!self.connectedWithHub) {
                clientHub.start().then(function () {

                    console.log("SignalR connected to ");
                    self.connectedWithHub = true;
                    if (reconnect) {
                        var department = getStorageKeyObject('client-department');
                        if (department != null)
                            self.targetDepartment = department;
                        // establish hub connection
                        clientHub.invoke("connect", self.userId, self.targetDepartment, self.clientInfo, self.livechatId, self.projectId, self.lang);
                        self._invokeEventCallbacks('agent-try-connect');
                    }
                    else {

                        if (self.department == null)//case botconnector
                            self.department = { id: "default", names: [{ value: "default", lang: self.lang }] };

                        self.connectWithAgent(self.department.id, self.department.name);
                    }


                }).catch(function (err) {
                    console.error("SignalR connection error: ", err.toString());

                });
                //$.connection.hub.start(g_transport).done(function () {
                //    self.connectedWithHub = true;   
                //    if(reconnect)
                //    {
                //        var department = getStorageKeyObject('client-department');
                //        if (department!=null)
                //            self.targetDepartment = department;
                //        // establish hub connection
                //        clientHub.server.connect(self.userId, self.targetDepartment, self.clientInfo, self.livechatId, self.projectId,self.lang);
                //        self._invokeEventCallbacks('agent-try-connect');
                //    }
                //    else
                //    {
                //       /* clientHub.server.GetDepatrments(self.projectId)
                //            .done(function (data) {
                //                self._invokeEventCallbacks('display-department',response);
                //            }).fail(function () {

                //            });*/

                //        if(self.department == null)//case botconnector
                //            self.department = {id:"default", names:[{value:"default",lang:self.lang}]};

                //        self.connectWithAgent(self.department.id,self.department.name);
                //    }
                //});
            }
            else if (!reconnect) {
                if (self.department == null)//case botconnector
                    self.department = { id: "default", names: [{ value: "default", lang: self.lang }] };

                self.connectWithAgent(self.department.id, self.department.name);
            }

            self._invokeEventCallbacks('agent-try-connect');
        }

        function levenshtein(s, t) {
            var d = []; //2d matrix

            // Step 1
            var n = s.length;
            var m = t.length;

            if (n == 0) return m;
            if (m == 0) return n;

            //Create an array of arrays in javascript (a descending loop is quicker)
            for (var i = n; i >= 0; i--) d[i] = [];

            // Step 2
            for (var i = n; i >= 0; i--) d[i][0] = i;
            for (var j = m; j >= 0; j--) d[0][j] = j;

            // Step 3
            for (var i = 1; i <= n; i++) {
                var s_i = s.charAt(i - 1);

                // Step 4
                for (var j = 1; j <= m; j++) {

                    //Check the jagged ld total so far
                    if (i == j && d[i][j] > 4) return n;

                    var t_j = t.charAt(j - 1);
                    var cost = (s_i == t_j) ? 0 : 1; // Step 5

                    //Calculate the minimum
                    var mi = d[i - 1][j] + 1;
                    var b = d[i][j - 1] + 1;
                    var c = d[i - 1][j - 1] + cost;

                    if (b < mi) mi = b;
                    if (c < mi) mi = c;

                    d[i][j] = mi; // Step 6

                    //Damerau transposition
                    if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                    }
                }
            }

            // Step 7
            return d[n][m];
        }
        function isNumeric(str) {
            if (typeof str != "string") return false // we only process strings!  
            return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
                !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
        }
        //___________________________Apis__________________________//
        function handleDepartment(utterance) {
            var departmentId = "", departmenName = "";
            var userChoice = -1;

            self.departmentsTrailCount++;

            if (self.departmentsTrailCount > 3) {
                self.connectionMode = "bot";
                $("#custServiceConnectId").hide();
                $("#custServiceUploadAttmentId").hide();
                self._invokeEventCallbacks('display-static-response', "عذرا لقد استنفذت  المحاولات .....");
                return;
            }

            if (isNumeric(utterance)) {
                userChoice = parseInt(utterance);

                if (userChoice < 1 || userChoice > self.departments.length) {

                    var response = { departments: self.departments, reDisplay: true };
                    self._invokeEventCallbacks('display-department', response, Bots.lang);

                    return;
                }

                departmentId = self.departments[userChoice - 1]._id;
                departmenName = self.departments[userChoice - 1].names[0].value;
            }
            else {
                var minDistance = 0.3;
                var selectedIndex = -1;

                for (var i = 0; i < self.departments.length; i++) {

                    for (var j = 0; j < self.departments[i].names.length; j++) {

                        var disatance = levenshtein(utterance, self.departments[i].names[j].value);

                        disatance = disatance / self.departments[i].names[j].value.length;

                        if (disatance < minDistance) {
                            minDistance = disatance;
                            userChoice = i;
                        }

                    }
                }
                if (userChoice == -1) {
                    var response = { departments: self.departments, reDisplay: true };
                    self._invokeEventCallbacks('display-department', response, self.lang);
                    return;
                }

                departmentId = Bots.departments[userChoice]._id;
                departmenName = Bots.departments[userChoice].names[0].value;

            }
            //Bots.departments
            Bots.connectWithAgent(departmentId, departmenName);
        }


        function startConversation(reConnect) {
            var time = new Date();

            if (self.currentUtteranceWelcome)
                self._invokeEventCallbacks('clear-conversation');

            var param = "";
            if (self.param != null) {
                var obj = JSON.parse(self.param);
                var name, x = "";
                for (name in obj) {
                    param += name + "##" + obj[name] + "@@";
                }
                self.paramUsed = true;
            }
            self.sendAjaxCall(WelcomeApi, JSON.stringify({ id: self.projectId, userId: self.userId, sessionId: self.sessionId, projectId: self.livechatId, channel: "web", message: "welcome", lang: self.lang, param: param }), 2, reConnect);

            //$("#msg_block").append(WelcomeApi);

        }


        function endSession() {
            var time = new Date();

            if (self.currentUtteranceWelcome)
                self._invokeEventCallbacks('clear-conversation');

            $.ajax
                ({
                    type: "POST",
                    url: EndSessionApi,
                    dataType: 'json',
                    headers: { "X-Auth": self.authToken },
                    contentType: 'application/json',
                    data: JSON.stringify({ id: self.projectId, userId: self.userId }),
                    success: function (response) {
                    },
                    fail: function () {
                        self._invokeEventCallbacks('net-connection-error');
                    }
                });
        }


        function logout() {
            if (Bots.connectionMode == "bot") {
                msgInputDisabled = true;
                $("#msg_input").prop("disabled", true);
                setTimeout(function () { msgInputDisabled = false; }, 3000);
            }
            routeUtterance("تسجيل خروج", false);

            /*var time = new Date();
            
            if (self.currentUtteranceWelcome)
                self._invokeEventCallbacks('clear-conversation');

            $.ajax
                ({
                    type: "POST",
                    url: logoutApi,
                    dataType: 'json',
                    headers: { "X-Auth":self.authToken},
                    contentType: 'application/json', 
                    data: JSON.stringify({id:self.projectId, userId:self.userId,sessionId:self.sessionId }),
                    success: function(response) {
                        //eraseCookie("sessionInfo");
                    },
                    fail:function() {
                        self._invokeEventCallbacks('net-connection-error');
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        if (XMLHttpRequest.readyState == 4) {
                            // HTTP error (can be checked by XMLHttpRequest.status and XMLHttpRequest.statusText)
                        }
                        else if (XMLHttpRequest.readyState == 0) {
                            // Network error (i.e. connection refused, access denied due to CORS, etc.)
                        }
                        else {
                            // something weird is happening
                        }
                        
                        self._invokeEventCallbacks('net-connection-error');
                    }

                });*/
        }
        function routeUtterance(utterance, reConnect) {
            var time = new Date();

            if (self.connectionMode == "waiting") {
                writeToLogs(utterance);
                return;
            }

            if (self.connectionMode == "department") {
                handleDepartment(utterance);
                return;
            }

            if (self.connectionMode == "agent" && !reConnect) {
                $("#msg_input").prop("disabled", false);
                sendToAgent(utterance);
                return;
            }

            if (self.currentUtteranceWelcome)
                self._invokeEventCallbacks('clear-conversation');

            var param = "";
            if (self.param != null) {
                var obj = JSON.parse(self.param);
                var name, x = "";
                for (name in obj) {
                    param += name + "##" + obj[name] + "@@";
                }
                self.paramUsed = true;
            }

            var encrypt = self.encrypt;

            if (self.encrypt) {
                utterance = encryptUtterance(utterance);
                self.encrypt = false;
            }
            self.sendAjaxCall(GetResponseApi, JSON.stringify({ id: self.projectId, userId: self.userId, sessionId: self.sessionId, projectId: self.livechatId, channel: "web", message: utterance, param: param, encrypted: encrypt }), 1, reConnect);
        }

        function getURLIntent() {

            self.sendAjaxCall(TrackURLApi, JSON.stringify({ id: self.projectId, userId: self.userId, sessionId: self.sessionId, projectId: self.livechatId, channel: "web", message: g_webUrl }), 4, false);

        }

        function fireBotIntent(intent) {
            $.ajax
                ({
                    type: "POST",
                    url: fireIntentApi,
                    dataType: 'json',
                    /*username: username,
                    password: password,*/
                    contentType: 'application/json',
                    headers: { "X-Auth": self.authToken },
                    data: JSON.stringify({ id: self.projectId, userId: self.userId, sessionId: self.sessionId, projectId: self.livechatId, channel: "web", message: intent }),
                    success: function (response) {
                        self._invokeEventCallbacks('handle-tracked-url', response);
                    },
                    fail: function () {
                        self._invokeEventCallbacks('net-connection-error');
                    }
                });
        }
        return self;
    }

    function onExit() {
        if (getTimeStampStorageKey('connected'))
            setTimeStampStorageKey('connected', true);
    }

    if (typeof (window.Bots) === 'undefined') {
        window.Bots = alkhwaizmiBots();
        window.onbeforeunload = onExit;
    }

})(window);

$(function () {


    var msgInputDisabled = false;
    var g_playResponse = false;
    var g_prvscrollHeight = 0;
    var g_latitude = 24.63729930218282, g_longitude = 46.71724857917838;
    var g_MapInit = false;
    //____________________Init _______________________________//
    var userId = document.getElementById('userId').value;
    var projectId = document.getElementById('chatbotId').value;
    var authToken = document.getElementById('tokenId').value;
    if (document.getElementById('livechatMode') != null)
        g_liveChatMode = document.getElementById('livechatMode').value;
    if (document.getElementById('livechatId') != null)
        g_livechatId = document.getElementById('livechatId').value;
    var webViewElement = document.getElementById('directWebviewMode');
    var angularElement = document.getElementById('webviewMode');

    if (angularElement != null)
        g_angularMode = angularElement.value;

    if (webViewElement != null)
        g_webviewMode = webViewElement.value;


    //setCookie("userId",userId,30);

    //'https://alkhawarizmi.xyz:6060=userId=17054; expires=Fri, 16-Oct-2020 10:49:43 GMT; path=/; SameSite=None; Secure'

    var cursorcolor = "#3d3d3e";

    if (projectId == 171)
        cursorcolor = "#67ca28";
    else if (projectId == 172)
        cursorcolor = "#11af79";
    else if (projectId == 147 || projectId == 305)
        cursorcolor = "#00B2FF";
    else if (projectId == 150)
        cursorcolor = "#5333a7";
    else if (projectId == 239 || projectId == 227)
        cursorcolor = "#2a7fc2";
    else if (projectId == 271)
        cursorcolor = "#28574d";
    else if (projectId == 284)
        cursorcolor = "#54565a";
    else if (projectId == 290)
        cursorcolor = "#1fbbb4";
    else if (projectId == 296)
        cursorcolor = "#0075c9";




    var nice = $("#conversation").niceScroll({ cursorborder: "", cursorborderradius: 0, cursorwidth: 5, cursorcolor: cursorcolor, boxzoom: false, background: "#14141400", railalign: "left", autohidemode: 'leave' });  // The document page (body)

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(setPosition, setError);
        }
    }

    function setPosition(position) {
        g_latitude = position.coords.latitude;
        g_longitude = position.coords.longitude;
        //alert("g_latitude:"+g_latitude+"g_longitude"+g_longitude);
    }

    function setError(error) {
        var x = 5;

        x++;
    }

    function Picker() {

        if (g_MapInit)
            return;

        g_MapInit = true;

        var locationPicker = $('.location-picker').locationPicker({
            locationChanged: function (data) {
                g_latitude = data.location.lat;
                g_longitude = data.location.long;
            },
            init: {
                //current_location: true,
                location: { latitude: g_latitude, longitude: g_longitude } // put initial location here
            }
            // put initial location here
        });

        //locationPicker.setMapLocation(g_latitude,g_longitude,true);
    }

    function printMap() {
        console.log(latitude);
        console.log(longitude);
    }

    function displayCaptcha() {
        $("#generalSurveyId").addClass('hidepage');
        $("#chatbotModalId").addClass('hidepage');
        $("#mapPageId").addClass('hidepage');
        $("#captchaPageId").removeClass('hidepage');
    }

    function savePrvScrollHeight() {
        var elem = document.getElementById('conversation');
        //g_prvscrollHeight = elem.scrollHeight;
    }

    function scrollToEnd() {
        var elem = document.getElementById('conversation');
        elem.scrollTop = elem.scrollHeight - elem.clientHeight;
        //g_prvscrollHeight = elem.scrollHeight;
    }


    function scroll() {
        var mainContainer = document.getElementById('conversation');
        var elem = document.getElementById('msg_block');
        var newContentSize = elem.scrollHeight - g_prvscrollHeight;

        if (newContentSize > (mainContainer.clientHeight - 110)) {
            mainContainer.scrollTop = mainContainer.scrollHeight - newContentSize - 110;
        }
        else
            mainContainer.scrollTop = mainContainer.scrollHeight - newContentSize;

        g_prvscrollHeight = elem.scrollHeight;
    }

    //_______________Display Fucntions_________________________//
    function changeLinkRef(string) {

        if (!iOS() || g_angularMode != "1")
            return string;

        const hrefs = string.match(/href=([\",\'])([^\b\s]+)/g);
        if (hrefs) {

            string = string.replace("target='_blank'", "");

            hrefs.forEach(function (href) {

                url = href.match(/(https?:\/\/[^ ]*)([^"|^'])/g);
                //alert("IOs");
                string = string.replace(href, 'href="javascript:parent.postMessage(\'' + url + '\', \'*\')"');

            });
        }

        //<a href="javascript:parent.postMessage('https://www.riyadbank.com/ar/personal-banking/current-account/onboarding/', '*')">
        return string;
        //return string.replace("(", "<br/>(");
    }

    function renderMediaResponse(text, mediaUrl, date, type, language) {

        if (language == null)
            language = "ar";

        if (type == "receiver")
            text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var mediaType = getTypeOfMediaFromURL(mediaUrl);
        var html = '';
        if (mediaType === 'image')
            html = '<div  class="row message-body"><div class="col-sm-12 message-main-' + type + '"> <div class="' + type + '"> <div class="message-text ' + language + '"><div class="image-card"><img src="' + mediaUrl + '" onload="scrollImg()"/><h3><p>' + text + '</p></h3></div> </div> <div class="message-time"> ' + date + '</div></div></div></div>';
        else
            html = '<div  class="row message-body"><div class="col-sm-12 message-main-' + type + '"> <div class="' + type + '"> <div class="message-text ' + language + '"><div class="' + mediaType + '-card"><div class="' + mediaType + '-icon"></div><a target="_blank" class="media-link" href="' + mediaUrl + '">Download</a> <h3><p>' + text + '</p></h3></div> </div> <div class="message-time"> ' + date + '</div></div></div></div>';

        $("#msg_block").append(html);
        scrollImg();
    }

    function getTypeOfMediaFromURL(link) {
        link = link.toLowerCase();
        if (link.includes("image"))
            return "image";
        else if (link.includes("video"))
            return "video";
        else if (link.includes("pdf"))
            return "pdf";
        else if (link.includes("file-txt"))
            return "file-txt";
        return "NOT-SUPORT-TYPE";
    }

    function renderResponse(text, date, type, language) {
        if (language == null)
            language = "ar";

        if (type == "receiver")
            text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        var html = '<div  class="row message-body"> <div class="col-sm-12 message-main-' + type + '"> <div class="' + type + '"> <div class="message-text ' + language + '">' + text + ' </div> <div class="message-time"> ' + date + '</div></div></div></div>';
        $("#msg_block").append(html);
    }

    function renderTypingIndicator() {
        var html = '<div  class="row message-body" id="typingIndicatorId"><div class="col-sm-12 message-main-sender"><div class="sender"><div class="typingIndicatorContainer"><div class="typingIndicatorBubble"><div class="typingIndicatorBubbleDot"></div> <div class="typingIndicatorBubbleDot"></div><div class="typingIndicatorBubbleDot"></div></div></div></div></div></div>';
        $("#msg_block").append(html);
    }

    function renderAgentTypingIndicator() {
        var html = '<div  class="row message-body" id="agentTypingIndicatorId"><div class="col-sm-12 message-main-employee"><div class="employee"><div class="typingIndicatorContainer"><div class="typingIndicatorBubble"><div class="typingIndicatorBubbleDot"></div> <div class="typingIndicatorBubbleDot"></div><div class="typingIndicatorBubbleDot"></div></div></div></div></div></div>';
        $("#msg_block").append(html);
    }

    function htmlgeoLocationMS(text, date, type) {
        var html = '<div  class="row message-body"> <div class="col-sm-12 message-main-' + type + '"> <div class="' + type + '"> <div id="showMapId" class="message-text geolocation mouse-pointer"><img class="loaction-icon" src="/bots-logo/sharelocation.png">' + text + ' </div> <div class="message-time"> ' + date + '</div></div></div></div>';
        $("#msg_block").append(html);
    }
    function htmlGeoUtterance(text, date, type) {
        var html = '<div  class="row message-body"> <div class="col-sm-12 message-main-' + type + '"> <div class="' + type + '"> <div class="message-map mouse-pointer" data="' + text + '"><img class="map-img" src="/bots-logo/map.jpg">' + '' + ' </div> <div class="message-text"> الموقع على الخريطة</div> <div class="message-time"> ' + date + '</div></div></div></div>';
        $("#msg_block").append(html);
    }
    function htmlAttachmenMS(text, date, type) {
        var html = '<div  class="row message-body"> <div class="col-sm-12 message-main-' + type + '"> <div class="' + type + '"> <div id="botAttachmentId" class="message-text varAttachment mouse-pointer"><img class="loaction-icon" src="/bots-logo/attachment.png">' + text + ' </div> <div class="message-time"> ' + date + '</div></div></div></div>';
        $("#msg_block").append(html);
    }


    function creatOptionsHTML(responseOptions) {
        var html = "";

        if (responseOptions.title.length > 0)
            html = "<h3>" + responseOptions.title + "</h3>";

        if (responseOptions.type == "list")
            html += "<ul>";
        else {
            if (responseOptions.main == "1")
                html += "<ol class='smenu'>";
            else
                html += "<ol class='menu'>";
        }

        for (var i = 0; i < responseOptions.rOptions.length; i++) {

            responseOptions.rOptions[i].title = changeLinkRef(responseOptions.rOptions[i].title);

            if (responseOptions.rOptions[i].icon != null && responseOptions.rOptions[i].icon.length > 0) {
                html += "<li><div class='optionItem'><img  src=\"" + responseOptions.rOptions[i].icon + "\"/>" + "</div><span>" + responseOptions.rOptions[i].title + "</span></li>";
            }
            else
                html += "<li>" + responseOptions.rOptions[i].title + "</li>";
        }

        if (responseOptions.type == "list")
            html += "</ul>";
        else
            html += "</ol>";

        return html;
    }

    function createYesNoConfirmationHTML(message, language) {

        var html = "";
        if (language == "ar")
            html = "<div class = 'more'>" + message + "</div><div class = 'moreOptions'><span class='yes'>نعم</span><span class='no'>لا</span> </div>";
        else
            html = "<div class = 'more'>" + message + "</div><div class = 'moreOptions'><span class='yes'>Yes</span><span class='no'>No</span> </div>";

        return html;
    }
    function createOptionsHBHTML(responseOptions) {
        var html = "";

        if (responseOptions.title.length > 0)
            html = "<h4>" + responseOptions.title + "</h4>";

        html += "<div class='options-HB'>";

        for (var i = 0; i < responseOptions.rOptions.length; i++) {
            html += "<span>" + responseOptions.rOptions[i].title + "</span>";
        }

        html += "</div>";
        return html;
    }

    function createMediaHTML(media, type) {
        var html = "";
        let ext = media.src.substring(media.src.length - 4, media.src.length).toLowerCase();

        media.title = changeLinkRef(media.title);

        if (ext == ".pdf" || type == "pdf") {
            html = "<div class = 'pdf-card'><a target='_blank' href='" + media.src + "'><div class='pdf-image'></div><h3>" + media.title + "</h3></a></div>";
        }
        else {
            if (media.hyperlink)
                html = "<div class = 'image-card'><a target='_blank' href='" + media.hyperlink + "'><img src='" + media.src + "' onload='scrollImg()'><h3>" + media.title + "</h3></a></div>";
            else
                html = "<div class = 'image-card'><img src='" + media.src + "' onload='scrollImg()'><h3>" + media.title + "</h3></div>";
            //html = "<div class = 'image-card'><a target='_blank' href='" + media.src + "'><img src='" + media.src + "' onload='scrollImg()'><h3>" + media.title + "</h3></a></div>";
        }
        //html = "<div class = 'image-card'><img src='" + image.src + "'><h3>" + image.title + "</h3></div>";

        return html;
    }

    function ratingSystem(response, history) {

        var html = "";

        if (response.title.length > 0)
            html = "<div>" + response.title + "</div>";

        var maxRating = response.rOptions.length;

        if (history) {
            var stars = "";
            for (var i = 0; i < maxRating; i++) {
                stars += "<i class='fa fa-star' aria-hidden='true' data-default='true' data-rating='1'></i>";
            }

            html += "<div class='ratingContainer'><span class='xrating' data-current-rating=0 data-max-mark=" + maxRating + ">" + stars + "</span></div>";
        }
        else
            html += "<div class='ratingContainer'><span class='rating' data-current-rating=0 data-max-mark=" + maxRating + "></span></div>";

        return html;
    }

    function replaceEmojis(message) {

        if (message.indexOf("<Emj id='") == -1)
            return message;

        message = message.replace(new RegExp("<Emj id='1'/>", 'g'), "<img src='/plugins/Emojis/Emoji-1.png' style='width: 24px'/>");
        message = message.replace(new RegExp("<Emj id='2'/>", 'g'), "<img src='/plugins/Emojis/Emoji-2.png' style='width: 24px'/>");

        return message;
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //demo();
    async function displayResponse(botResponse, history, lastItem, mode = "sender") {

        var html = "", allHtml = "";
        var time = new Date();
        var i = 0;
        var rating = false;
        var responseLength = 0;

        if (botResponse.Responses)
            responseLength = botResponse.Responses.length;

        if (!history)
            await sleep(200);

        $("#typingIndicatorId").remove();

        if (botResponse.singleCard && responseLength == 1)
            botResponse.singleCard = 0;

        if (botResponse.preLogin != null)
            renderResponse(botResponse.preLogin, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);

        for (var j = 0; j < responseLength; j++) {

            var response = botResponse.Responses[i];

            if (response.delay != null && !history && !botResponse.singleCard) {

                renderTypingIndicator();
                await sleep(response.delay * 1000);
            }


            $("#typingIndicatorId").remove();

            if (response.type == "text") {

                response.message = replaceEmojis(response.message);
                response.message = changeLinkRef(response.message);

                if (botResponse.singleCard) {
                    allHtml += response.message;
                }
                else {

                    if (response.mType != null && response.mType == "1")
                        htmlgeoLocationMS(response.message, time.getHours() + ":" + time.getMinutes(), mode + ' geo-sender');
                    else if (response.mType != null && response.mType == "2")
                        htmlAttachmenMS(response.message, time.getHours() + ":" + time.getMinutes(), mode + ' geo-sender');
                    else
                        renderResponse(response.message, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);

                }


                if (response.message.indexOf('لقد تمت عملية الدخول للحساب بنجاح') != -1 && self.projectId == 134)
                    alawwalUser = botResponse.attachedProcess;
            }
            else if (response.type == "options" || response.type == "list") {
                if (response.rating != null && response.rating == "1") {
                    if (lastItem)
                        history = false;

                    html = ratingSystem(response, history);
                    rating = true;
                    $("#msg_input").prop("disabled", true);

                }
                else
                    html = creatOptionsHTML(response);

                if (botResponse.singleCard)
                    allHtml += html;
                else
                    renderResponse(html, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);
            }
            else if (response.type == "optionsHB") {
                html = createOptionsHBHTML(response);
                if (botResponse.singleCard)
                    allHtml += html;
                else
                    renderResponse(html, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);
            }
            else if (response.type == "yesno") {
                html = createYesNoConfirmationHTML(response.message, botResponse.language);
                if (botResponse.singleCard)
                    allHtml += html;
                else
                    renderResponse(html, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);
            }
            //else if (response.type == "image") { ahmed-taha 14-3
            else if (response.type && response.template) {
                html = createMediaHTML(response.template, response.type);
                if (botResponse.singleCard)
                    allHtml += html;
                else
                    renderResponse(html, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);
            }


            i++;
        }

        if (botResponse.singleCard)
            renderResponse(allHtml, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);

        if (botResponse.postLogin != null)
            renderResponse(botResponse.postLogin, time.getHours() + ":" + time.getMinutes(), mode, botResponse.language);

        scroll();

        if (!rating || history) {
            $("#msg_input").prop("disabled", false);
            if (!isMobile())
                $("#msg_input").focus();
            //scrollImg();
        }

        if (!history)
            setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 400);
        //setTimeout(scroll, 10);
        if (rating && !history) {
            setTimeout(function () {
                $(".rating").magicRatingInit({
                    success: function (magicRatingWidget, rating) {
                        $("#msg_input").prop("disabled", false);
                        if (!isMobile())
                            $("#msg_input").focus();

                        $("#msg_input").val(rating.toString());
                        g_utterance = rating.toString();
                        sendUtterance();
                        $(".magic-rating-icon").removeClass("magic-rating-icon");
                        $(".ratingContainer .rating").addClass("xrating").removeClass("rating");


                        //alert(rating);
                    }
                })
            }, 100);
        }

    }

    function displayConversationHistory(botResponse) {

        var time = new Date();

        for (var i = 0; i < botResponse.conversation.length; i++) {

            var conversation = botResponse.conversation[i];

            if (conversation.user != undefined) {
                if (conversation.user.indexOf("geoLOC=[") == 0 || conversation.user.indexOf("geoloc=[") == 0)
                    htmlGeoUtterance(conversation.user, time.getHours() + ":" + time.getMinutes(), 'receiver');
                else if (conversation.user == "welcome") {

                }
                else
                    renderResponse(conversation.user, time.getHours() + ":" + time.getMinutes(), 'receiver', botResponse.language);

                $("#msg_input").prop("disabled", false);
                if (!isMobile())
                    $("#msg_input").focus();
            }

            var type = "sender";
            if (conversation.agent != undefined) {
                conversation.bot = conversation.agent;
                type = "employee";
            }

            if (conversation.bot != undefined) {

                if (conversation.bot.singleCard == "1")
                    conversation.bot.singleCard = 1;
                else
                    conversation.bot.singleCard = 0;

                if (i != (botResponse.conversation.length - 1)) {
                    for (var j = 0; j < conversation.bot.Responses.length; j++) {
                        var response = conversation.bot.Responses[j];
                        if (response.type == "text") {
                            if (response.mType != null && response.mType == "1")
                                response.mType = "0";
                        }
                    }
                }

                lastItem = false;
                if (i == botResponse.conversation.length - 1)
                    lastItem = true;

                displayResponse(conversation.bot, true, lastItem, type);

                if (i != botResponse.conversation.length - 1) {
                    $(".moreOptions").addClass('hideOptions');
                    //$(".more").addClass('hideOptions');
                }
            }
            if (i != (botResponse.conversation.length - 1))
                $(".menu").removeClass('menu');
            //$(".smenu").removeClass('smenu');
        }
        setTimeout(scrollToEnd, 200);
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 400);
    }

    function displayAttackResponse() {

        var errorMsg = "عذرا التصرف الذي تتبعه يعتبر مخالفا لسياسة الاستخدام، وقد تم حظرك لعدة دقائق...";
        var time = new Date();

        $("#typingIndicatorId").remove();

        renderResponse(errorMsg, time.getHours() + ":" + time.getMinutes(), 'sender', "ar");

        scroll();
        $("#msg_input").prop("disabled", false);
        if (!isMobile())
            $("#msg_input").focus();

    }


    function displayErrorJsonResponse() {

        var errorMsg = "عذرا حدث خطأ في الاتصال...";
        var time = new Date();

        $("#typingIndicatorId").remove();
        renderResponse(errorMsg, time.getHours() + ":" + time.getMinutes(), 'sender', "ar");

        scroll();
        $("#msg_input").prop("disabled", false);
        if (!isMobile())
            $("#msg_input").focus();

    }

    function displayErrorInConnectionResponse() {

        var errorMsg = "عذرا، هناك عطل في الاتصال بالإنترنت ...";
        var time = new Date();

        $("#typingIndicatorId").remove();
        renderResponse(errorMsg, time.getHours() + ":" + time.getMinutes(), 'sender', "ar");

        scroll();
        $("#msg_input").prop("disabled", false);
        if (!isMobile())
            $("#msg_input").focus();

    }

    function displayStaticResponse(errorMsg) {

        var time = new Date();

        $("#typingIndicatorId").remove();
        renderResponse(errorMsg, time.getHours() + ":" + time.getMinutes(), 'sender', "ar");

        scroll();
        $("#msg_input").prop("disabled", false);
        if (!isMobile())
            $("#msg_input").focus();

    }


    //_______________start callbcak function_______________________//
    async function onHandleResponse(response, reConnectMode) {

        var botResponse;

        msgInputDisabled = false;
        response = response.replace(/(\r\n\t|\n|\r\t)/gm, "");

        try {
            botResponse = JSON.parse(response);
        } catch (e) {
            displayErrorJsonResponse();
            return;
        }

        //SetCookies
        if (botResponse.sessionId != null) {
            Bots.setSessionId(botResponse.sessionId);
            var sessionInfo = { sessionId: botResponse.sessionId, botId: Bots.projectId };
            //setCookie("sessionInfo",JSON.stringify(sessionInfo),10*60);
            setStorageWithExpiration("sessionInfo", JSON.stringify(sessionInfo), 10 * 60);

        }

        if (botResponse.encrypt != null && botResponse.encrypt == "1") {
            Bots.setEncrypt(true);
        }

        if (botResponse.masked != null && botResponse.masked == "1")
            g_MaskedInput = true;

        //convert to customer service
        if (botResponse.attacker != null && botResponse.attacker == 1) {
            //displayAttackResponse();
            displayCaptcha();
            return;
        }

        Bots.setLang(botResponse.language);
        //convert to customer service
        if (botResponse.action != null && botResponse.action == 1) {
            $("#typingIndicatorId").remove();
            Bots.liveChat(false, botResponse.attachedVar);
            //return;
        }
        if (botResponse.login != null && botResponse.login == "true") {
            $("#typingIndicatorId").remove();
            //$("#logoutIconId").show();
            Bots.loggedSession = true;
            sendMessageToParent("logout#$#show");
        } else {
            Bots.loggedSession = false;

            sendMessageToParent("logout#$#hide");
        }

        //bank alawal
        if (self.projectId == 134 && botResponse.attachedProcess != null) {
            if (botResponse.attachedProcess.indexOf("incompleted") != -1) {
                completedUserId = botResponse.attachedProcess.split('@@')[1];
                $("#bellId").attr('src', '/bots-logo/abel.png');
                $("#nofProcessId").show();
                $("#incompleted").removeClass("disabled");
            }
        }

        if (botResponse.serviceEvent != null) {
            sendMessageToParent("service#$#" + botResponse.serviceEvent);
        }

        if (reConnectMode) {
            openConversation();

        }
        //response
        if (botResponse.Responses != undefined) {
            if (botResponse.Responses.length > 0)
                PlayText(botResponse.Responses);

            await displayResponse(botResponse, false, false);
        } //conversation History
        else if (botResponse.conversation != undefined)
            displayConversationHistory(botResponse);

        if (reConnectMode && Bots.agentConncetionMessage != null) {
            var time = new Date();
            renderResponse(Bots.agentConncetionMessage, time.getHours() + ":" + time.getMinutes(), 'employee', "ar");
            //renderResponse("اختبار الرسالة", time.getHours() + ":" + time.getMinutes(), 'employee',"ar");
        }

    }

    function clearConversation() {
        $("#msg_block").empty();
    }

    function openConversation() {
        sendMessageToParent("openConversation");
        setTimeout(scroll, 200);
    }
    function changeScroll() {
        $("#conversation").getNiceScroll().resize();
        scrollToEnd();
    }
    function onHandleTrackedUrl(response) {
        var botResponse;

        response = response.replace(/(\r\n\t|\n|\r\t)/gm, "");

        try {
            botResponse = JSON.parse(response);
        } catch (e) {
            displayErrorJsonResponse();
            return;
        }

        //SetCookies
        if (botResponse.sessionId != null) {
            Bots.setSessionId(botResponse.sessionId);
            var sessionInfo = { sessionId: botResponse.sessionId, botId: Bots.projectId };
            //setCookie("sessionInfo",JSON.stringify(sessionInfo),10*60);
            setStorageWithExpiration("sessionInfo", JSON.stringify(sessionInfo), 10 * 60);
        }

        if (botResponse.Responses != undefined) {

            if (botResponse.Responses.length > 0 && botResponse.Responses[0].message == "NoAction")
                return;

            openConversation();
            displayResponse(botResponse, false, false);

            setTimeout(changeScroll, 400);
        }
    }

    function onDisplayDepartment(response, lang) {

        if (response.reDisplay) {
            var html = "<ol class='dmenu'>";
            var departmentName = "";

            for (var i = 0; i < response.departments.length; i++) {

                departmentName = response.departments[i].names[0].value;

                for (var j = 0; j < response.departments[i].names.length; j++) {
                    if (response.departments[i].names[j].lang == lang) {
                        departmentName = response.departments[i].names[j].value;
                        break;
                    }
                }

                html += "<li value='" + departmentName + "' dId='" + response.departments[i]._id + "' >" + departmentName + "</li>";

            }
            html += "</ol>";

            var time = new Date();
            renderResponse("الرجاء اختيار القسم من القائمة:", time.getHours() + ":" + time.getMinutes(), 'sender', 'en');
            renderResponse(html, time.getHours() + ":" + time.getMinutes(), 'sender', 'en');

            Bots.connectionMode = "department";
        }
        else if (response.status == 1 && response.departments != null) {
            var html = "<ol class='dmenu'>";
            var departmentName = "";

            for (var i = 0; i < response.departments.length; i++) {

                departmentName = response.departments[i].names[0].value;

                for (var j = 0; j < response.departments[i].names.length; j++) {
                    if (response.departments[i].names[j].lang == lang) {
                        departmentName = response.departments[i].names[j].value;
                        break;
                    }
                }

                html += "<li value='" + departmentName + "' dId='" + response.departments[i]._id + "' >" + departmentName + "</li>";

            }
            html += "</ol>";

            var time = new Date();
            renderResponse("الرجاء اختيار القسم من القائمة:", time.getHours() + ":" + time.getMinutes(), 'sender', 'en');
            renderResponse(html, time.getHours() + ":" + time.getMinutes(), 'sender', 'en');

            Bots.connectionMode = "department";
        }
        else if (response.status == 2 && response.departments != null) {
            Bots.connectWithAgent(response.departments[0]._id, response.departments[0].names[0].value);
        }
        else
            Bots.connectWithAgent("default", "default");

        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 400);
    }


    function onRoomStart(message) {
        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();
        renderResponse(message, date, 'employee', 'ar');
        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 200);
    }
    function iOS() {
        return [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ].includes(navigator.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }
    function _urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function (url) {
            return '<a target="_blank" href="' + url + '">' + url + '</a>';
        })
        // or alternatively
        // return text.replace(urlRegex, '<a href="$1">$1</a>')
    }

    function urlify(string) {
        const urls = string.match(/((((ftp|https?):\/\/)|(w{3}\.))[\-\w@:%_\+.~#?,&\/\/=]+)/g);
        if (urls) {
            urls.forEach(function (url) {
                if (g_angularMode == "1" && iOS()) {
                    //alert("IOs");
                    string = string.replace(url, '<a  class="en" href="javascript:parent.postMessage(\'' + url + '\', \'*\')">' + '<div>' + url + '</div></a>');
                }
                else
                    string = string.replace(url, '<a target="_blank" class="en" href="' + url + '">' + '<div>' + url + '</div></a>');
            });
        }

        //<a href="javascript:parent.postMessage('https://www.riyadbank.com/ar/personal-banking/current-account/onboarding/', '*')">
        return string;
        //return string.replace("(", "<br/>(");
    }



    function onAddAgentMessage(message, mediaUrl) {

        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();

        if ($("#agentTypingIndicatorId").length > 0)
            $("#agentTypingIndicatorId").remove();

        message = urlify(message);

        if (mediaUrl != null && mediaUrl.length > 0)
            renderMediaResponse(message, mediaUrl, date, 'employee', Bots.lang);
        else
            renderResponse(message, date, 'employee', Bots.lang);


        setTimeout(function () { scroll(); $("#conversation").getNiceScroll().resize(); }, 200);
    }


    function onSetAgentTypingMode(mode) {

        if (mode)
            renderAgentTypingIndicator();
        else {
            if ($("#agentTypingIndicatorId").length > 0)
                $("#agentTypingIndicatorId").remove();
        }
    }

    function onRoomClosed(message) {

        $("#custServiceConnectId").hide();
        $("#custServiceUploadAttmentId").hide();
        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();
        renderResponse(message, date, 'employee', Bots.lang);
        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 200);

    }

    function onRoomClosedNewRequest(message) {
        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();
        renderResponse(message, date, 'employee', Bots.lang);
        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 200);
    }

    function manageAgentDisconnect() {
        /*if (Bots.connectionMode!="agent")
            Bots.closeCSConversation();*/
    }

    function onRoomDisconnect(message) {
        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();
        renderResponse(message, date, 'employee', Bots.lang);
        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 200);

        var myVar = setTimeout(function () { manageAgentDisconnect() }, 60000);
    }

    function AgentNotAvaliable(message) {
        $("#custServiceConnectId").hide();
        $("#custServiceUploadAttmentId").hide();
        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();
        renderResponse(message, date, 'employee', Bots.lang);
        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 200);
    }

    function RequestClosed(message) {

        Bots.connectionMode = "bot";
        Bots.connectedWithHub = false;
        setTimeStampStorageKey('requestAgent', false);

        AgentNotAvaliable(message);
    }

    function NotifyClient(message) {

        var time = new Date();
        var date = time.getHours() + ":" + time.getMinutes();
        renderResponse(message, date, 'employee', Bots.lang);
        scroll();
        setTimeout(function () { $("#conversation").getNiceScroll().resize(); }, 200);
    }


    function onAgentTrytoConnect() {
        $("#custServiceConnectId").show();
        //$("#custServiceUploadAttmentId").show();

        $("#msg_input").prop("disabled", false);
    }

    function onAgentConnected() {
        $("#custServiceConnectId").show();
        $("#custServiceUploadAttmentId").show();

        $("#msg_input").prop("disabled", false);
    }

    function sendUtterance() {
        if (msgInputDisabled)
            return;

        var utterance = $("#msg_input").val().trim();
        //alert(utterance+"=>"+g_utterance);
        if (utterance.length == 0)
            g_utterance = "";
        //var utterance = g_utterance;
        var temptterance = g_utterance.toLowerCase();
        var ret = temptterance.search("script")
        if (ret != -1) {
            //utterance=encodeURIComponent(utterance); 
            g_utterance = g_utterance.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }
        $("#msg_input").height("22px");

        if (g_utterance == '')
            return;

        $(".menu").removeClass('menu');
        $(".moreOptions").addClass('hideOptions');

        var time = new Date();

        renderResponse(utterance, time.getHours() + ":" + time.getMinutes(), 'receiver', 'ar');
        scroll();

        $("#conversation").getNiceScroll().resize();


        $("#msg_input").val("");
        g_MaskedInput = false;

        if (Bots.connectionMode == "bot") {
            msgInputDisabled = true;
            $("#msg_input").prop("disabled", true);
            setTimeout(function () { msgInputDisabled = false; }, 3000);
        }

        if (Bots.projectId == 134)
            $("#incompleted").show();


        if (Bots.connectionMode == "bot")
            renderTypingIndicator();

        console.log("utterance=>" + g_utterance);

        Bots.sendMessage(g_utterance);
        g_utterance = "";

    }

    function sendGeoUtterance(lat, long) {

        if (msgInputDisabled)
            return;

        var time = new Date();

        var utterance = "geoLOC=[" + lat + "," + long + "]";
        htmlGeoUtterance(utterance, time.getHours() + ":" + time.getMinutes(), 'receiver');
        scroll();

        $("#conversation").getNiceScroll().resize();

        msgInputDisabled = true;
        setTimeout(function () { msgInputDisabled = false; }, 3000);

        $("#msg_input").val("");
        $("#msg_input").prop("disabled", true);

        if (self.projectId == 134)
            $("#incompleted").show();


        Bots.sendMessage(utterance);
    }
    //__________text To Speech___________________//
    function PlayText(responses) {

        if (!g_playResponse)
            return;

        var message = "";
        for (var i = 0; i < responses.length; i++) {

            var response = responses[i];

            if (response.type == "text") {
                message += response.message.replace(/<(?:.|\n)*?>/gm, '');
                message += " ";

            } else if (response.type == "options") {
                message += response.title.replace(/<(?:.|\n)*?>/gm, '');
                message += " ";

                var optionsText = "";
                for (var j = 0; j < response.rOptions.length; j++) {
                    optionsText += response.rOptions[j].title;

                    if (j != response.rOptions.length - 1)
                        optionsText += " أو ";
                }

                message += optionsText;

            }

        }
        responsiveVoice.speak(message, 'Arabic Male');
        //responsiveVoice
        /*responses.forEach(function myFunction(response) {
            if (response.type == "text") {
                var message = response.message.replace(/<(?:.|\n)*?>/gm, '');
                responsiveVoice.speak(message, 'Arabic Male');
            } else if (response.type == "options")
            {
                var message = response.title.replace(/<(?:.|\n)*?>/gm, '');
                message +=" ";
                
                var optionsText= "";
                for (var i = 0; i < response.rOptions.length; i++ ){
                    optionsText += response.rOptions[i].title;
                    
                    if (i != response.rOptions.length -1)
                        optionsText += " أو ";
                }
    
                message +=optionsText;
                responsiveVoice.speak(message, 'Arabic Male');
            }
        });*/

        g_playResponse = false;
    }
    function StopPlayText() {
        //responsiveVoice
        try {
            responsiveVoice.cancel();
            logEvent('responsiveVoice working');
        } catch (ex) {
            logEvent('responsiveVoice error: ' + ex.message);
        }

    }

    //__________Speech Recognation___________________//
    function isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }

    function logEvent(string) {
        //var log = document.getElementById('log');
    }

    //______________Load speech api____________________________//
    //var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (isChrome) {
        window.SpeechRecognition = window.SpeechRecognition ||
            window.webkitSpeechRecognition ||
            null;

        if (!SpeechRecognition) {
            document.querySelector('.js-api-support').removeAttribute('hidden');
            document.querySelector('.js-api-info').setAttribute('hidden', '');
            [].forEach.call(document.querySelectorAll('form button'), function (button) {
                button.setAttribute('disabled', '');
            });
        } else {
            var recognizer = new SpeechRecognition();
            var transcription = document.getElementById('msg_input');
            // Start recognising
            recognizer.addEventListener('result', function (event) {
                transcription.textContent = '';

                for (var i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcription.value = event.results[i][0].transcript;
                        g_utterance = transcription.value;
                        g_playResponse = true;
                        sendUtterance();
                        recognizer.stop();
                        //$("#startSpeechId").attr("src", "/images/microphone.png");
                        $("#startSpeechId").show();
                        $("#stopSpeechId").hide();

                    } else {
                        transcription.value += event.results[i][0].transcript;
                    }
                }
            });

            // Listen for errors
            recognizer.addEventListener('error', function (event) {
                logEvent('Recognition error: ' + event.message);
            });

            recognizer.addEventListener('end', function () {
                logEvent('Recognition ended');
            });
            ///_________________________End Speech Listener________________________//

            //document.getElementById('startSpeechId').addEventListener('click', function () {
            //$("#startSpeechId").click(function () {
            $("#speechRecognationId").on("click", "#startSpeechId", function () {
                transcription.textContent = '';

                // Set if we need interim results
                var isInterimResults = false;//document.querySelector('input[name="recognition-type"][value="interim"]').checked;

                recognizer.lang = "ar-SA";
                recognizer.continuous = true;
                recognizer.interimResults = false;
                //recognizer.continuous = !isInterimResults;
                //recognizer.interimResults = isInterimResults;

                try {
                    sendMessageToParent("startrecognize");
                    recognizer.start();
                    StopPlayText();
                    //"g-voice.gif"
                    //$("#startSpeechId").attr("src", "/images/g-voice.gif");
                    $("#startSpeechId").hide();
                    $("#stopSpeechId").show();

                    logEvent('Recognition started');
                } catch (ex) {
                    logEvent('Recognition error: ' + ex.message);
                }
            });

            document.getElementById('stopSpeechId').addEventListener('click', function () {
                recognizer.stop();
                $("#startSpeechId").show();
                $("#stopSpeechId").hide();

                logEvent('Recognition stopped');
            });
        }
    }
    else {
        $("#speechRecognationId").on("click", "#startSpeechId", function () {
            {
                sendMessageToParent("startrecognize");
            }
        });
    }

    //___________________________Start Frame Message System_____________________//
    var sendMessageToParent = function (msg) {
        // Make sure you are sending a string, and to stringify JSON
        window.parent.postMessage(msg, '*');
    };
    function bindEvent(element, eventName, eventHandler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, eventHandler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventName, eventHandler);
        }
    }

    // Listen to messages from parent window
    bindEvent(window, 'message', function (e) {

        if (e.data == "trackParentURL") {
            var location = window.location.href;
            if (e.origin.indexOf(g_DomainTrackURL) == -1)
                Bots.trackURL(e.origin);
            //alert(e.data + ", Orgin: " + e.origin);
        }
        else if (e.data.indexOf("trackURL") != -1) {
            var arg = e.data.split("#$#");
            if (arg.length > 1)
                Bots.trackURL(arg[1]);
            //alert("Frame URL: " + arg[1]);
        }
        else if (e.data.indexOf("fireIntent") != -1) {
            var arg = e.data.split("#$#");
            if (arg.length > 1)
                Bots.fireIntent(arg[1]);
            //alert("Frame URL: " + arg[1]);
        }
        else if (e.data.indexOf("open-widget") != -1) {
            var param = "";
            var arg = e.data.split("#$#");
            Bots.lang = arg[1];
            if (arg.length > 2) {
                param = arg[2];
                Bots.setParameter(param);
            }

            Bots.callWelcome(false);
        }
        else if (e.data.indexOf("set-parameter") != -1) {
            var param = "";
            var arg = e.data.split("#$#");
            if (arg.length > 1) {
                param = arg[1];
                Bots.setParameter(param);
            }
        }
        else if (e.data.indexOf("endrecognation") != -1) {
            var arg = e.data.split("#$#");
            if (arg.length > 1) {
                //alert(arg[1]);
                $("#msg_input").val(arg[1]);
                g_utterance = arg[1];
                sendUtterance();
            }
            //alert("Frame URL: " + arg[1]);
        }
        else if (e.data == "logout") {
            Bots.logout();
        }
    });
    //_________________End Frame Message System_____________________//
    //____________________Listeners _______________________________//

    $("#sendMessage").click(function () {
        var utterance = document.getElementById('msg_input').value;
        //alert(utterance+"=>"+g_utterance);
        handleUtterance();
        //alert(utterance+"=>"+g_utterance);
        sendUtterance();
        $('#speechRecognationId').show();
        $('#sendMessage').hide();

    });


    $("#custServiceConnectId").click(function () {
        Bots.closeCSConversation();
    });
    $("#custServiceUploadAttmentId").click(function () {
        console.log("Upload Image ");
        g_attachmentMode = 0;
        $("#attchedInput").val("");//if user upload same image should clear value
        $("#attchedInput").click();
    });

    $("#attchedInput").change(function () {

        var file = $("#attchedInput").prop('files')[0];
        console.log('This file size is: ' + file.size / 1024 / 1024 + "MiB");
        var fileSize = file.size / 1024 / 1024;
        if (fileSize > 5) {
            alert("Allowed file Size is 5 MB. your file Size is :" + fileSize + "MB");
            return;
        }

        var myformData = new FormData();
        myformData.append('file', file);
        var UploadAttchmentApi = "/api/attchement";
        $.ajax({
            method: 'post',
            processData: false,
            contentType: false,
            cache: false,
            data: myformData,
            enctype: 'multipart/form-data',
            url: UploadAttchmentApi,
            success: function (response) {

                console.log(response);
                Bots.sendMediaToAgent(response.path);

                var time = new Date();

                renderMediaResponse("", response.path, time.getHours() + ":" + time.getMinutes(), 'receiver', Bots.lang);
                setTimeout(function () { scroll(); }, 200);

                if (g_attachmentMode == 1) {
                    $(".varAttachment").removeClass("mouse-pointer");
                    $(".varAttachment").removeClass("varAttachment");

                    Bots.sendMessage(response.path);
                }
            }
        });

    });
    function handleUtterance() {
        var utterance = document.getElementById('msg_input').value;
        var maskedUtterance = "";
        if (g_MaskedInput) {
            if (utterance.length) {
                if (utterance.length > g_utterance.length) {
                    g_utterance += utterance.substring(g_utterance.length);
                }
                else {
                    g_utterance = g_utterance.substring(0, utterance.length);
                }

                for (var i = 0; i < g_utterance.length; i++) {
                    maskedUtterance += "*";
                }

                //utterance = utterance.replace(/.*/g, "*");
            }
            else {
                g_utterance = "";
            }

            $("#msg_input").val(maskedUtterance);
        }
        else
            g_utterance = utterance;

        //alert("DD")

    };

    $('#msg_input').on('paste', function (e) {
        $('#sendMessage').show();
    });

    $("#msg_input").keypress(function (e) {
        //console.log("keypress"+e.key+":"+e.which);

        if (e.which === 13 || e.which === 10) {
            var utterance = document.getElementById('msg_input').value;
            //alert(utterance+"=>"+g_utterance);
            handleUtterance();
            sendUtterance();
        }
    });

    $('#msg_input').on('keydown', function (e) {
        var editor = $(this);
        var h = editor.height();
        var x = editor.scrollTop();
        if (editor.scrollTop()) {
            $(this).height(function (i, h) {
                return h + 22;
            });
        }
    });

    $("#msg_input").keyup(function (e) {
        //console.log("keyup"+e.key+":"+e.which);
        handleUtterance();
        if (e.which === 13 || e.which === 10) {

            $("#msg_input").val("");
            return;
        }

        var editor = document.getElementById("msg_input");
        editor.style.height = "1px";
        var fullSize = editor.scrollHeight;
        var viewSize = editor.clientHeight;
        var scrollTop = editor.scrollTop;

        editor.style.height = (fullSize) + "px";


        var utterance = $("#msg_input").val().trim();

        if (utterance.length > 0) {
            $('#speechRecognationId').hide();
            $('#sendMessage').show();
        }
        else {
            $('#speechRecognationId').show();
            $('#sendMessage').hide();
        }
    });

    function endTimer() {
        clearInterval(g_stopWatch);

        $("#generalSurveyId").addClass('hidepage');
        $("#mapPageId").addClass('hidepage');
        $("#captchaPageId").addClass('hidepage');
        $("#chatbotModalId").removeClass('hidepage');
        $("#captchaSectionId").show();
        $("#timerSectionId").hide();
        $("#msg_input").prop("disabled", false);
        $("#msg_input").focus();

    }

    function callCaptcha(response) {
        var name = $('#contact-form-name').val(); //Validierung der Form-Daten
        var email = $('#contact-form-email').val();
        var CaptchaApi = "/api/bot/ResovleCaptcha";

        $.ajax({ //AJAX request
            type: "POST",
            url: CaptchaApi,
            data: { name: name, email: email, userId: userId, recaptcha: grecaptcha.getResponse() },
            success: function (response) {
                if (response == "OK") {
                    $("#captchaSectionId").hide();
                    $("#timerSectionId").show();

                    var fiveMinutes = 60 * 10, display = document.querySelector('#time');
                    stopWatch(fiveMinutes, display, endTimer);
                }
            },
        });
    }
    $("#submitCaptchaId").click(function () {
        callCaptcha();
    });

    $("#msg_input").click(function () {
        $("#replaySectionId").addClass('active');
    });

    $("#msg_input").focus(function () {
        $("#replaySectionId").addClass('active');
    });

    $("#msg_input").blur(function () {
        $("#replaySectionId").removeClass('active');
        var utterance = $("#msg_input").val().trim();
        if (utterance.length == 0) {
            $('#speechRecognationId').show();
            $('#sendMessage').hide();
        }
    });


    $("#replaySectionId").click(function () {
        $("#replaySectionId").addClass('active');
        $("#msg_input").focus();
    });

    $(".msg_block").on("click", ".smenu li", function () {

        $("#msg_input").val($(this).text());
        g_utterance = $(this).text();
        sendUtterance();
    });

    $(".msg_block").on("click", ".options-HB span", function () {

        $("#msg_input").val($(this).text());
        $(".options-HB").addClass('hideOptions');
        g_utterance = $(this).text();
        sendUtterance();
    });

    $(".msg_block").on("click", ".menu li", function () {

        $("#msg_input").val($(this).text());
        g_utterance = $(this).text();
        sendUtterance();
        $(".menu").removeClass('menu');
        $(".moreOptions").addClass('hideOptions');
        //$(".more").addClass('hideOptions');

    });
    $(".msg_block").on("click", ".dmenu li", function () {

        var departmentId = $(this).attr('did');
        var departmenName = $(this).attr('value');
        $("#msg_input").val(departmenName);
        $(".dmenu").removeClass('dmenu');
        g_utterance = departmenName;
        sendUtterance();
        //Bots.connectWithAgent(departmentId,departmenName);

    });
    $(".msg_block").on("click", ".moreOptions span", function () {
        $("#msg_input").val($(this).text());
        g_utterance = $(this).text();
        sendUtterance();
        $(".menu").removeClass('menu');
        $(".moreOptions").addClass('hideOptions');
        setTimeout(savePrvScrollHeight(), 2);
        //$(".more").addClass('hideOptions');

    });

    $(".msg_block").on("click", ".message-text a", function (event) {
        var href = $(this).attr("href");
        if (href == "hyber") {
            $("#msg_input").val($(this).text());
            $(this).attr("src", "hyber");
            sendUtterance();
            event.preventDefault();
        }
    });

    $("#mainMenuId").click(function () {
        //displayMainMenu(projectId);
    });

    $("#voiceCheckId").click(function () {
        g_playResponse = !g_playResponse;

        if (!g_playResponse)
            StopPlayText();
    });

    $('#webFrameId').on("load", function () {
        var webUrl = $('#webFrameId').contents().get(0).location.href;
        Bots.trackURL(webUrl);
    });

    $("#spashImageId").click(function () {
        $('#chatbotModalId').modal('show');
        $(this).parent('#splashscreen').fadeOut(500);
    });

    $(".msg_block").on("click", ".geolocation", function (event) {
        $("#generalSurveyId").addClass('hidepage');
        $("#chatbotModalId").addClass('hidepage');
        $("#captchaPageId").addClass('hidepage');
        $("#mapPageId").removeClass('hidepage');
        getLocation();
        Picker();
    });

    $(".msg_block").on("click", ".varAttachment", function (event) {
        g_attachmentMode = 1;
        $("#attchedInput").val("");//if user upload same image should clear value
        $("#attchedInput").click();
    });

    $("#cancelMapId").click(function () {
        $("#generalSurveyId").addClass('hidepage');
        $("#captchaPageId").addClass('hidepage');
        $("#mapPageId").addClass('hidepage');
        $("#chatbotModalId").removeClass('hidepage');
    });

    $("#acceptMapId").click(function () {
        $("#generalSurveyId").addClass('hidepage');
        $("#captchaPageId").addClass('hidepage');
        $("#mapPageId").addClass('hidepage');
        $("#chatbotModalId").removeClass('hidepage');
        sendGeoUtterance(g_latitude, g_longitude);
        $(".geolocation").removeClass('mouse-pointer');
        $(".geolocation").removeClass('geolocation');
    });


    Bots.init(userId, projectId, g_livechatId, authToken);
    Bots.on("handle-reponse", onHandleResponse);
    Bots.on("handle-tracked-url", onHandleTrackedUrl);

    Bots.on("agent-try-connect", onAgentTrytoConnect);
    Bots.on("agent-connected", onAgentConnected);


    Bots.on("start-room", onRoomStart);
    Bots.on("add-agent-message", onAddAgentMessage);
    Bots.on("set-agent-typing-mode", onSetAgentTypingMode);

    Bots.on("close-room", onRoomClosed);
    Bots.on("close-new-request", onRoomClosedNewRequest);
    Bots.on("room-diconnect", onRoomDisconnect);
    Bots.on("agent-not-avaliable", AgentNotAvaliable);
    Bots.on("request-rejected", AgentNotAvaliable);
    Bots.on("request-added", NotifyClient);
    Bots.on("request-closed", RequestClosed);


    Bots.on("display-department", onDisplayDepartment);
    Bots.on("net-connection-error", displayErrorInConnectionResponse);
    Bots.on("clear-conversation", clearConversation);
    Bots.on("display-static-response", displayStaticResponse);

    if (g_webviewMode == "1") {
        var lang = "ar";
        var langElement = document.getElementById('lang');
        if (langElement != null)
            lang = langElement.value;

        Bots.setLang(lang);
        Bots.callWelcome(false);
    }

    window.onbeforeunload = function (e) {
        // eraseCookie("sessionInfo");
        var sessionInfo = getCookie("sessionInfo");
        if (Bots.loggedSession && sessionInfo != "") {
            setCookie("sessionInfo", sessionInfo, 15);
        }
        return;
    };

    function handleRemoved(tabId, removeInfo) {
        console.log("Tab: " + tabId + " is closing");
        console.log("Window ID: " + removeInfo.windowId);
        console.log("Window is closing: " + removeInfo.isWindowClosing);
    }

});