#!/bin/bash
cd ~
acme.sh --renew-all
echo "本脚本用于在Linux服务器上自动化安装并配置xray服务，使用前请确保已申请好域名且域名解析正确，推荐使用Ubuntu系统以确保脚本正常运行。"
printf "按Enter键以开始。"
read pause
sudo ufw disable
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
sudo apt-get install nginx
sudo systemctl stop nginx
sudo apt-get install socat
sudo rm -rf /etc/crt.crt
sudo rm -rf /etc/key.key
printf "请选择CA（推荐选择buypass，若证书生成失败可尝试换成letsencrypt或zerossl）："
read ca
printf "请输入您的邮箱："
read email
curl  https://get.acme.sh | sh -s email=${email}
cd ~/.acme.sh/
alias acme.sh=~/.acme.sh/acme.sh
./acme.sh --set-default-ca --server ${ca}
printf "请输入您的域名："
read host
./acme.sh --issue -d ${host} --standalone --force
./acme.sh --install-cert -d ${host} --key-file /etc/xray.key --fullchain-file /etc/xray.crt --reloadcmd "systemctl restart xray"
sudo systemctl restart xray
sudo chmod 666 /etc/xray.crt
sudo chmod 666 /etc/xray.key
printf "请输入您准备用于开启xray服务的端口号（建议使用443，如仅更新证书请按Ctrl+C以结束脚本运行）："
read port
printf "请输入您的回落端口号（所有Xray不能识别的流量将被转发至该端口）："
read fallback
printf "请输入您的传输层协议（ws或tcp）："
read net
printf "请输入您的UUID（还没有UUID？访问网站https://www.uuidgenerator.net/生成一个叭）："
read uuid
echo "{\"log\": {\"access\": \"/var/log/xray/access.log\", \"error\": \"/var/log/xray/error.log\", \"loglevel\": \"warning\"}, \"inbounds\": [{\"tag\": \"proxy\", \"port\": ${port}, \"protocol\": \"vless\", \"settings\": {\"clients\": [{\"id\": \"${uuid}\", \"level\": 0, \"email\": \"${email}\"}], \"decryption\": \"none\", \"fallbacks\": [{\"dest\": ${fallback}}]}, \"streamSettings\": {\"network\": \"${net}\", \"security\": \"tls\", \"tlsSettings\": {\"fingerprint\": \"chrome\", \"certificates\": [{\"certificateFile\": \"/etc/xray.crt\", \"keyFile\": \"/etc/xray.key\"}]}}}], \"outbounds\": [{\"protocol\": \"freedom\"}]}" > /usr/local/etc/xray/config.json
sudo systemctl restart xray
sudo systemctl restart nginx
echo "xray服务安装并配置完成，您的端口号为：${port}；您的UUID为：${uuid}；您的传输层协议为：${net}；您的底层传输安全协议为：tls；您的加密方式为：none。"
echo "下面开始配置BBR加速，如已配置BBR加速，可按Ctrl+C以结束脚本运行。"
read none
sudo wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh && chmod +x bbr.sh && ./bbr.sh