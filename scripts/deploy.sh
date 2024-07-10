#!/bin/bash

while getopts "n:v:p:" opt; do
  case $opt in
    n)
      network=$OPTARG
      ;;
    v)
      version=$OPTARG
      ;;
    p)
      project=$OPTARG
      ;;
    *)
      echo "usage: $0 -n network -v version -p project"
      exit 1
      ;;
  esac
done

if [ -z "$network" ]; then
  echo "错误: 选项 -n 是必选的"
  echo "使用: $0 -n 参数A -v 参数B"
  exit 1
fi

if [ -z "$version" ]; then
  echo "错误: 选项 -v 是必选的"
  echo "使用: $0 -n 参数A -v 参数B"
  exit 1
fi

if [ -z "$project" ]; then
  echo "错误: 选项 -p 是必选的"
  echo "使用: $0 -n 参数A -v 参数B -p 参数C"
  exit 1
fi

if [ -z "$GRAPH_AUTH" ]; then
  echo "错误: GRAPH_AUTH 是必选的"
  echo "使用环境变量制定 GRAPH_AUTH=<value> command"
  exit 1
fi

echo "选项 -n 的参数: $network"
echo "选项 -v 的参数: $version"
echo "选项 -p 的参数: $project"
echo "环境变量GRAPH_AUTH的参数: $GRAPH_AUTH"

graph clean

cp subgraph.yaml.${network} subgraph.yaml

graph codegen && graph build --network-file==networks.json.${network}

graph auth --studio $GRAPH_AUTH
 
graph deploy --version-label=${version} --network-file=networks.json.${network} --studio ${project}