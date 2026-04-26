<template>
  <div>
    <!-- メインコンテンツエリア -->
    <main class="max-w-md mx-auto px-4 py-6 space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 animate-in fade-in zoom-in duration-300">
        <!-- ロゴ表示部分 -->
        <div class="flex justify-center">
          <img src="@/assets/logo.svg" alt="わかめナビ ロゴ" class="h-28 w-auto" @error="handleImageError" />
        </div>

        <div class="space-y-4 text-gray-600 leading-relaxed text-sm">
          <p>本日はわかめナビ🌱をご利用いただきまして、誠にありがとうございます。</p>
          <p>埼玉大学前を通っている国道463号線(通称「埼大通り」)は、埼玉県越谷市、さいたま市、所沢市を経て、入間市へと至る国道であり、その総距離は58kmにもなります。主要幹線道路のため、その交通量は非常に多く、交通渋滞が発生することも少なくありません。その結果として10～30分の遅延が発生することもあり、従来の時刻表があてにならないという事態も生じています。</p>
          <p>これらの遅延状況を知らせるものとして、国際興業バス及び西武バスには、それぞれにバス走行位置を確認することのできるサービスがあります。しかしながら、それらを一括で閲覧することはできません。</p>
          <p>そこでわかめナビ🌱では、埼玉大学周辺を走るバスの運行情報を一括で閲覧することができるようにし、次に乗るバスを簡単に確認することができるようにしました。素敵な大学生活を支えるインフラの一つになれば幸いにございます。</p>
          <p class="text-xs text-gray-500 bg-gray-50 p-4 rounded-lg mt-6 leading-relaxed">なお当サイトは、埼玉大学に在学している学生が開発しているものであり、埼玉大学とは一切関係ございません。お問い合わせは<a href="https://twitter.com/SU_Mentsuyu" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-bold">こちら</a>までお願いいたします。</p>
        </div>

        <div class="pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          <p>© わかめナビ🌱</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  const handleImageError = (e: Event) => {
    const img = e.target as HTMLImageElement;
    img.onerror = null;
    img.style.display = "none";
  };
</script>
