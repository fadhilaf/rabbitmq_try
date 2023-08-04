import amqp from "amqplib";

const main = async () => {
  // buat TCP connection
  const connection = await amqp.connect("amqp://127.0.0.1");
  // buat TCP channel (utk misahin traffic from each thread of job, karena amqp itu stateful)
  const channel = await connection.createChannel();
  const msg = "Hello World!";

  // // exchange direct >>
  // const queue = "hello";

  // buat queue kalau belum ada, kalau sudah ada pakai queue dengan nama yang sama
  // await channel.assertQueue(queue, {
  //   durable: false, //durable ini kalau true, queue akan survive restart rabbitmq (tetap ada queue ny meskipun rabbitmq di restart)
  // });

  // kirim pesan ke queue
  // channel.sendToQueue(queue, Buffer.from(msg));
  // // exchange direct <<

  // // exchange fanout >>
  // buat exchange amqp dulu
  await channel.assertExchange('fanout_test', 'fanout', {
    durable: false,
  }) // yg direct exchange, pake exchange default namonyo '' (nameless exchange). tapi yg ini kito buat nian dulu exchange ny dk pke default (dk biso kalo nk fanout kalo pake default exchange, soalny default exchange type ny direct)

  //buat binding queue ke exchange fanout (tiap exchange kalo mau ngirim pesan ke queue, harus ada binding ke queue dulu)
  for (const queue of ['0', '2', '3']) {
    await channel.assertQueue(queue, {
      durable: false,
    });

    await channel.bindQueue(queue, 'fanout_test', ''); //bind queue
  }

  channel.publish('fanout_test', '', Buffer.from(msg)) // kirim ke exchange, exchange ny nanti yg kirim ke queue2 yg terikat ke exchange ini (exchange fanout tidak perlu kasi nama queue, karena dikasih ke tiap queue yg terbind sama exchange fanout ini)
  // // exchange fanout <<
  
  // ada satu lagi tipe exchange yg dipake yaitu topic,
  // kalo direct send to queue, kalo fanout publish langsung ke namae exchange
  // topic perlu nama exchange dan routing key (routing key bisa pake wildcard)
  // jadi di exchange type topic, perlu dikasih routing key sama nama queue, idk kyk exchange type yg lain
  // soalny itu gek yg nentuin topic topic ny, tapi skip si ribet nn (usala pake :v)

  console.log(`[x] Sent ${msg}`);
  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
};

main().catch(console.error);
