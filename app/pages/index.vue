<template>
  <main class="space-y-8">
    <div class="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50/50 p-8 space-y-8 animate-in fade-in zoom-in duration-500 ease-out">
      <div class="flex justify-center -mt-2">
        <!-- Optional: Add a subtle glow behind the logo -->
        <div class="relative">
          <div class="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-50"></div>
          <img src="@/assets/logo.svg" alt="わかめナビ ロゴ" class="w-auto h-24 relative z-10" />
        </div>
      </div>

      <div class="space-y-5 text-[15px] text-slate-600 leading-[1.8]">
        <p class="font-bold text-emerald-800 text-lg">わかめナビ🌱をご利用いただき、誠にありがとうございます。</p>
        <p>埼玉大学前を通る国道463号線（通称「埼大通り」）は、埼玉県越谷市からさいたま市、所沢市を経て入間市へと至る、総延長約58kmの主要幹線道路です。交通量が非常に多く、渋滞が発生することも少なくありません。その結果、バスの運行に10〜30分の遅れが生じることもあり、時刻表通りにバスが来ないという事態も起きています。</p>
        <p>そこでわかめナビ🌱では、埼玉大学周辺のバスの運行情報を一括で閲覧し、次に乗るバスを簡単に確認できるようにしました。皆様の充実した大学生活を支えるインフラの一つとなれば幸いです。</p>

        <div class="p-5 rounded-2xl bg-emerald-50/50 text-xs text-emerald-700/80 leading-relaxed border border-emerald-100/50 space-y-2">
          <p>なお、本サービスは埼玉大学、国際興業株式会社様、西武バス株式会社様とは一切関係ございません。お問い合わせは<a href="https://x.com/SU_Mentsuyu" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-500 hover:underline font-bold transition-colors">こちら</a>までお願いいたします。</p>
          <p>また、本サービスではアクセスの分析・利便性の向上のため、Google Analyticsを使用しております。データ収集のためにCookieを使用していますが、これは匿名で収集されており個人を特定するものではありません。</p>
        </div>
      </div>

      <div class="pt-6 border-t border-slate-100/80 text-xs text-slate-400 text-center font-medium tracking-wide">
        <p>&copy; 2026 長谷 玄武 (Genbu Hase)</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { useSeoMeta } from "#imports";

  useSeoMeta({
    title: "わかめナビ🌱",
    ogTitle: "わかめナビ🌱",
  });
</script>