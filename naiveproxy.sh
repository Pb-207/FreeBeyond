#!/bin/bash
cd ~
echo "本脚本用于在Linux服务器上自动化安装并配置NaiveProxy服务，第二次运行本脚本将自动更新SSL证书，使用前请确保已申请好域名且域名解析正确，推荐使用Ubuntu系统以确保脚本正常运行。"
printf "按Enter键以开始。"
read pause
sudo ufw disable
sudo apt install golang-go
sudo go env -w GO111MODULE=on
sudo go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
sudo ~/go/bin/xcaddy build --with github.com/caddyserver/forwardproxy@caddy2=github.com/klzgrad/forwardproxy@naive
cp caddy /usr/bin/
sudo setcap cap_net_bind_service=+ep /usr/bin/caddy
sudo apt-get install socat
printf "请输入您的邮箱："
read email
printf "请输入您的域名："
read host
printf "请输入您准备用于开启NaiveProxy服务的端口号（建议使用443）："
read port
printf "请设置您的用户名："
read user
printf "请设置您的密码："
read pass
mkdir /etc/caddy/
touch /etc/caddy/Caddyfile
echo -e "{\n  order forward_proxy before file_server\n}\n:${port}, ${host} {\n  tls ${email}\n  forward_proxy {\n    basic_auth ${user} ${pass}\n    hide_ip\n    hide_via\n    probe_resistance\n  }\n  file_server {\n    root /var/www/html\n  }\n}" > /etc/caddy/Caddyfile
cd ~
touch caddy-start.sh
echo "./caddy start --config /etc/caddy/Caddyfile" > caddy-start.sh
sudo chmod +x caddy-start.sh
./caddy-start.sh
echo "NaiveProxy服务安装并配置完成，您的端口号为：${port}；您的用户名为：${user}；您的密码为：${pass}；您的传输层协议为：tcp；按Enter键以部署BBR加速。"
read pause
sudo wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh && chmod +x bbr.sh && ./bbr.sh
