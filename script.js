// 应用配置信息
var appConfig = {
    appId: '101169',
    jsArray: [
        'core.requestAuthCode',
        'core.requestAccess',
        'network.request'
    ],
    getJsTicketUrl: 'https://yzb-code-storage-api-app.david-health.cn/Api/getJsApiCheckInfo',
};

// !在yzb.ready中执行对应的操作.
function init() {
    yzb.ready(() => {
        getCode();
    });
}

function getCode() {
    if (window.yzb.helper.isRunInClientDesktop()) {
        var resultDom = document.querySelector('#result');
        resultDom.innerText = '正在获取中...';
        getAuthCode().then(function (code) {
            resultDom.innerText = code;
        }).catch(function (e) {
            resultDom.innerText = '获取code失败!';
            alert('获取code失败');
        });
    } else {
        alert('请在猿之棒应用内调试！');
    }
}

// !获取 auth code Promise封装
// !第一步、获取当前页面URL签名信息
// !第二步、进行config配置
// !第三步、获取auth code
function getAuthCode() {
    return new Promise(function (resolve, reject) {
        getJsTicketInfo().then(function (result) {
            result['js_api_list'] = appConfig.jsArray;
            result['is_spa'] = true;  // 是否为单页应用,单页面应用会对域名进行授权,域名下切换path不需要重新验证
            // 进行config配置
            config(result).then(function () {
                // 配置成功可以进行获取access code
                requestAuthCode(appConfig.appId).then(function (code) {
                    // 这里返回code信息，请求交换用户信息 / token
                    resolve(code);
                }).catch(function (error) {
                    reject(error);
                });
            }).catch(function (error) {
                reject(error);
            });
        }).catch(function (error) {
            reject(error);
        });
    })
}

// !获取数据js签名信息
function getJsTicketInfo() {
    return new Promise(function (resolve, reject) {
        const url = window.location.href;
        const postData = { url: url };
        ajax(appConfig.getJsTicketUrl, postData)
            .then(function (response) {
                if ("2000" === response.status) {
                    // 验证成功
                    resolve(response.data);
                } else {
                    reject(response);
                }
            }).catch(function (error) {
                reject(error);
            });
    });
}

// !进行config配置
function config(jsTicketInfo) {
    return new Promise(function (resolve, reject) {
        const config = {
            data: jsTicketInfo,
            next: function (result) {
                resolve(result);
            },
            error: function (error) {
                reject(error);
            }
        };
        yzb.core.config(config);
    });
}

// 获取auth code
function requestAuthCode(appId) {
    return new Promise(function (resolve, reject) {
        const config = {
            data: { app_id: appId },
            next: function (result) {
                const code = result.code;
                resolve(code);
            },
            error: function (error) {
                reject(error);
            }
        };
        yzb.core.requestAuthCode(config);
    });
}

// ajax Promise封装
function ajax(url, postData) {
    return new Promise(function (resolve, reject) {
        const formData = new FormData();
        Object.keys(postData).forEach((key) => {
            formData.append(key, postData[key]);
        });
        var ajaxObj = new XMLHttpRequest();
        ajaxObj.open('POST', url, true);
        ajaxObj.timeout = 1000 * 10;
        ajaxObj.send(formData);
        ajaxObj.onreadystatechange = function () {
            if (ajaxObj.readyState === 4) {
                if (ajaxObj.status === 200) {
                    resolve(JSON.parse(ajaxObj.response));
                } else {
                    reject();
                }
            }
        };
    });
}