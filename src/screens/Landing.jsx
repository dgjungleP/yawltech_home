import React from "react";
// Sections
import TopNavbar from "../components/Nav/TopNavbar";
import Header from "../components/Sections/Header";
import Services from "../components/Sections/Services";
import Projects from "../components/Sections/Projects";
import Blog from "../components/Sections/Blog";
import Pricing from "../components/Sections/Pricing";
import Contact from "../components/Sections/Contact";
import Footer from "../components/Sections/Footer";
import { Modal } from "antd";

function updateNotice() {
  Modal.confirm({
    title: "更新提示",
    content: "检测到新版本，建议立即更新以确保平台正常使用。",
    okText: "确认更新",
    cancelText: "稍后更新",
    centered: true,
    onOk: () => {
      window.location.reload();
    },
  });
}

// 存储当前脚本标签的哈希值集合
let scriptHashes = new Set();
let timer = undefined;
let time = 0;
/**
 * 从首页获取脚本标签的哈希值集合
 * @returns {Promise<Set<string>>} 返回包含脚本标签的哈希值的集合
 */
async function fetchScriptHashes() {
  // 获取首页HTML内容
  const html = await fetch("/").then((res) => res.text());
  // 正则表达式匹配所有<script>标签
  let scriptRegex = /<script.*?src="([^"]+\.js)"/;
  // 获取匹配到的所有<script>标签内容
  const scripts = html.match(scriptRegex) ?? [];
  // 将脚本标签内容存入集合并返回
  return new Set(scripts);
}

/**
 * 比较当前脚本标签的哈希值集合与新获取的集合，检测是否有更新
 */
async function compareScriptHashes() {
  // 获取新的脚本标签哈希值集合
  const newScriptHashes = await fetchScriptHashes();
  // 如果超过了与之则停止加载
  if (time >= 10) {
    clearInterval(timer);
    timer = null;
    return;
  }
  if (scriptHashes.size === 0) {
    // 初次运行时，存储当前脚本标签哈希值
    scriptHashes = newScriptHashes;
  } else if (
    scriptHashes.size !== newScriptHashes.size ||
    ![...scriptHashes].every((hash) => newScriptHashes.has(hash))
  ) {
    // 如果脚本标签数量或内容发生变化，则认为有更新
    console.info("更新了", {
      oldScript: [...scriptHashes],
      newScript: [...newScriptHashes],
    });
    // 清除定时器
    clearInterval(timer);
    timer = null;
    // 提示用户更新
    updateNotice();
  } else {
    // 没有更新
    console.info("没更新", {
      oldScript: [...scriptHashes],
    });
  }
  time++;
}
// 检测鼠标是否移动 移动代表用户活跃中 把轮询比较用的次数一直清0
let moveFunction = () => {
  if (timer != null) {
    return;
  }
  clearInterval(timer);
  timer = null;
  time = 0;
  // 长时间挂机后 不在轮询的网页 在鼠标活跃于窗口的时候重新检测
  if (!timer) {
    timer = setInterval(compareScriptHashes, 6000);
  }
};

window.addEventListener("mousemove", moveFunction);
export default function Landing() {
  return (
    <>
      <TopNavbar />
      <Header />
      <Services />
      <Projects />
      <Blog />
      {/* <Pricing /> */}
      <Contact />
      <Footer />
    </>
  );
}
