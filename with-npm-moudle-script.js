const { Renderer } = require("@yuanzhibang/renderer");

var appConfig = {
    appId: '101192',
    jsApiList: [
        'core.requestAuthCode',
        'core.requestAccess'
    ],
    getJsApiCheckInfoApiUrl: 'https://demo-api-app.yuanzhibang.com/Api/getJsApiCheckInfo',
    getUserOpenIdAndTokenApiUrl: 'https://demo-api-app.yuanzhibang.com/Api/getUserinfoTokenByCode',
};

// !在yzb.ready中执行对应的操作.
function init() {
    yzb.ready(() => {
        document.getElementById('submit').addEventListener('click', () => {
            signIn();
        });
        signIn();
    });
}

init();

async function signIn() {
    if (yzb.helper.isRunInClientDesktop()) {
        var codeResultDom = document.querySelector('#auth_code_result');
        var openIdResultDom = document.querySelector('#open_id_result');
        var tokenResultDom = document.querySelector('#token_result');
        codeResultDom.innerText = '正在获取中...';
        try {
            var authCodeInfo = await getAuthCodeWithYzbRenderer();
            codeResultDom.innerText = authCodeInfo.code;
            var userTokenInfo = await getUserinfoByCode(appConfig.getUserOpenIdAndTokenApiUrl, authCodeInfo.code);
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

function getAuthCodeWithYzbRenderer() {
    return Renderer.getAuthCode(appConfig.appId, appConfig.jsApiList, getJsApiCheckInfo(appConfig.getJsApiCheckInfoApiUrl));
}

function getUserinfoByCode(apiUrl, code) {
    var data = { code: code };
    return requestApi(apiUrl, data);
}


function getJsApiCheckInfo(apiUrl) {
    const url = window.location.href;
    const postData = { url: url };
    return new Promise((resolve, reject) => {
        requestApi(apiUrl, postData).then((response) => {
            resolve(response)
        }).catch((error) => {
            reject(error);
        });
    });
}


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