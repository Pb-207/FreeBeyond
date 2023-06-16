#!/bin/bash
cd ~
acme.sh --renew-all
echo "本脚本用于在Linux服务器上自动化安装并配置NaiveProxy服务，使用前请确保已申请好域名且域名解析正确，推荐使用Ubuntu系统以确保脚本正常运行。"
printf "按Enter键以开始。"
read pause
sudo ufw disable
sudo apt-get install --fix-missing golang-go
sudo go env -w GO111MODULE=on
sudo go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
sudo ~/go/bin/xcaddy build --with github.com/caddyserver/forwardproxy@caddy2=github.com/klzgrad/forwardproxy@naive
cp caddy /usr/bin/
sudo setcap cap_net_bind_service=+ep /usr/bin/caddy
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
./acme.sh --install-cert -d ${host} --key-file /etc/key.key --fullchain-file /etc/crt.crt --reloadcmd "./caddy start --config /etc/caddy/caddy.json"
sudo chmod 666 /etc/crt.crt
sudo chmod 666 /etc/key.key
printf "请输入您准备用于开启NaiveProxy服务的端口号（建议使用443，如仅更新证书按Ctrl+C以结束脚本运行叭）："
read port
printf "请设置您的用户名："
read user
printf "请设置您的密码："
read pass
mkdir /etc/caddy/
touch /etc/caddy/caddy.json
echo "{  \"admin\": {    \"disabled\": true  },  \"logging\": {    \"sink\": {      \"writer\": {        \"output\": \"discard\"      }    },    \"logs\": {      \"default\": {        \"writer\": {          \"output\": \"discard\"        }      }    }  },  \"apps\": {    \"http\": {      \"servers\": {        \"srv0\": {          \"listen\": [            \":${port}\"          ],          \"routes\": [            {              \"handle\": [                {                  \"handler\": \"subroute\",                  \"routes\": [                    {                      \"handle\": [                        {                          \"auth_pass_deprecated\": \"${pass}\",                          \"auth_user_deprecated\": \"${user}\",                          \"handler\": \"forward_proxy\",                          \"hide_ip\": true,                          \"hide_via\": true,                          \"probe_resistance\": {}                        }                      ]                    },                    {                      \"match\": [                        {                          \"host\": [                            \"${host}\"                          ]                        }                      ],                      \"handle\": [                        {                          \"handler\": \"file_server\",                          \"root\": \"/var/www/html/\",                          \"index_names\": [                            \"index.html\"                          ]                        }                      ],                      \"terminal\": true                    }                  ]                }              ]            }          ],          \"tls_connection_policies\": [            {              \"match\": {                \"sni\": [                  \"${host}\"                ]              }            }          ],          \"automatic_https\": {            \"disable\": true          }        }      }    },    \"tls\": {      \"certificates\": {        \"load_files\": [          {            \"certificate\": \"/etc/crt.crt\",            \"key\": \"/etc/key.key\"          }        ]      }    }  }}" > /etc/caddy/caddy.json
cd ~
touch caddy-start.sh
sudo echo "./caddy start --config /etc/caddy/caddy.json"
sudo chmod +x caddy-start.sh
./caddy-start.sh
echo "NaiveProxy服务安装并配置完成，您的端口号为：${port}；您的用户名为：${user}；您的密码为：${pass}；您的传输层协议为：tcp；按Enter键以部署BBR加速。"
read pause
sudo wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh && chmod +x bbr.sh && ./bbr.sh
