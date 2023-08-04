import amqp from "amqplib";

const main = async () => {
  // buat TCP connection
  const connection = await amqp.connect("amqp://127.0.0.1");
  // buat TCP channel (utk misahin traffic from each thread of job)
  const channel = await connection.createChannel();

  // utk tes direct exchange, queue name harus sama dengan routing key
  // const queue = "hello";

  // utk tes fanout exchange, nge tes dikirim ke semua queue atau tidak
  const queue = Math.floor(Math.random() * 10).toString(); // random queue name, gek kito assign ke exchange nyo setelah muncul

  // buat queue kalau belum ada, kalau sudah ada pakai queue dengan nama yang sama
  channel.assertQueue(queue, {
    durable: false, //durable ini kalau true, queue akan survive restart rabbitmq (tetap ada queue ny meskipun rabbitmq di restart)
  });

  console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

  channel.consume(queue, (msg) => {
    console.log(` [x] Received ${msg?.content.toString()}`);

    setTimeout(() => {
      console.log(" [x] Done");

      // Acknowledge the message to RabbitMQ (biar tau message udah di consume, dan rabbitmq tidak ngirim ngrim message ini lagi ke instance lain)
      channel.ack(msg!);
    }, 100);
  });
};

main().catch(console.error);
