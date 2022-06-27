// !第一步、获取当前页面URL签名信息
// !第二步、进行config配置
// !第三步、获取auth code
// !第四步、获取服务器端交换用户open_id并返回平台自己对应的token来进行用户校验

// 应用配置信息
var appConfig = {
    appId: '101192',
    jsArray: [
        'core.requestAuthCode',
        'core.requestAccess'
    ],
    getJsApiCheckInfoApiUrl: 'https://demo-api-app.yuanzhibang.com/Api/getJsApiCheckInfo',
    getUserOpenIdAndToken: 'https://demo-api-app.yuanzhibang.com/Api/getUserinfoTokenByCode',
};

// !在yzb.ready中执行对应的操作.
function init() {
    yzb.ready(() => {
        signIn();
    });
}

async function signIn() {
    if (yzb.helper.isRunInClientDesktop()) {
        var codeResultDom = document.querySelector('#auth_code_result');
        var openIdResultDom = document.querySelector('#open_id_result');
        var tokenResultDom = document.querySelector('#token_result');
        codeResultDom.innerText = '正在获取中...';
        try {
            // !第一步、获取当前页面URL签名信息
            var jsApiCheckInfo = await getJsApiCheckInfo(appConfig.getJsApiCheckInfoApiUrl);
            jsApiCheckInfo['js_api_list'] = appConfig.jsArray;
            jsApiCheckInfo['is_spa'] = true; // !是否为单页应用,单页面应用会对域名进行授权,域名下切换path不需要重新验证,否则验证path
            // !第二步、进行core.config配置
            await coreConfig(jsApiCheckInfo);
            // !第三步、获取auth code
            var authCode = await requestAuthCode(appConfig.appId);
            codeResultDom.innerText = authCode;
            // !第四步、获取服务器端交换用户open_id并返回平台自己对应的token来进行用户校验
            var userTokenInfo = await getUserinfoByCode(appConfig.getUserOpenIdAndToken, authCode);
            openIdResultDom.innerText = userTokenInfo.open_id;
            tokenResultDom.innerText = userTokenInfo.token;
        } catch (error) {
            codeResultDom.innerText = '获取code失败!';
            alert('获取code失败');
        }
    } else {
        alert('请在猿之棒应用内调试！');
    }
}


// ?-----------------------js接口相关方法------------------------------


// !进行config配置
function coreConfig(jsTicketInfo) {
    return new Promise((resolve, reject) => {
        const config = {
            data: jsTicketInfo,
            next: (result) => {
                resolve(result);
            },
            error: (error) => {
                reject(error);
            }
        };
        yzb.core.config(config);
    });
}

// !获取auth code
function requestAuthCode(appId) {
    return new Promise((resolve, reject) => {
        const config = {
            data: { app_id: appId },
            next: (result) => {
                const code = result.code;
                resolve(code);
            },
            error: (error) => {
                reject(error);
            }
        };
        yzb.core.requestAuthCode(config);
    });
}

// ?-----------------------网络接口相关方法------------------------------

// !获取数据js签名验证信息
function getJsApiCheckInfo(apiUrl) {
    const url = window.location.href;
    const postData = { url: url };
    return requestApi(apiUrl, postData);
}

// !使用code交换用户open_id
function getUserinfoByCode(apiUrl, code) {
    var data = { code: code };
    return requestApi(apiUrl, data);
}

// !ajax 请求 api Promise封装
function requestApi(url, postData) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        Object.keys(postData).forEach((key) => {
            formData.append(key, postData[key]);
        });
        var ajaxObj = new XMLHttpRequest();
        ajaxObj.open('POST', url, true);
        ajaxObj.timeout = 1000 * 10;
        ajaxObj.send(formData);
        ajaxObj.onreadystatechange = () => {
            if (ajaxObj.readyState === 4) {
                if (ajaxObj.status === 200) {
                    var apiResponse = JSON.parse(ajaxObj.responseText);
                    if ("2000" === apiResponse.status) {
                        // 返回成功
                        resolve(apiResponse.data);
                    } else {
                        reject(apiResponse);
                    }
                } else {
                    reject();
                }
            }
        };
    });
}