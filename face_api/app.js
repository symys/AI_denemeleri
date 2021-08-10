const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"), //yüzünü tanımlamak için
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"), //yüzünde çizgileri oluşturması için
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"), //yüzünü tanıması için
  faceapi.nets.faceExpressionNet.loadFromUri("/models") //duygunu tanımlaması için
]).then(startCamera()); //her biri async yüklenecek o sebeple promise ile cagırıyoruz
//hepsini yüklediğin anda then(startCamera()) kısmını çalıştır demiş oluyorum

function startCamera() {
  
  navigator.getUserMedia(
    {
      video: {} //getUserMedia obje alır, boş bir video objesi alıyorum kameradan
    },
    //kameradan gelen görüntüyü source'u stream olacak şekilde stream'e aktar diyoruz
    stream => (video.srcObject = stream),
    err => console.log(err) // hata verirse error gönder
  );
}

//video elementine bir event atıyoruz. play oldugu zaman bir fonksiyon calıstır diyorum.

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const boxSize = {
    width: video.width,
    height: video.height
  };

  faceapi.matchDimensions(canvas, boxSize); //canvastaki görüntü ile boxSize ölçülerini eşleştirir; kafayı ortaya alır

  setInterval(async () => {
    //async yazılmasının sebebi bütün bu işlemler asenkron olacak await demek için fonksiyona async demem lazım
    // await
    const detections = await faceapi //detections tespitler olarak belirlendi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()) //veriyi video dan alıp yeni bir const. kuruyoruz
      .withFaceLandmarks() //yüzdeki çizgileri tespit edecek
      .withFaceExpressions(); //duyguları tespit edecek

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); //canvası temizleyecek yani hareket ettiğinde bir önceki konumdaki canvası silecek
    const resizedDetections = faceapi.resizeResults(detections, boxSize); //tespit edilen yüzleri belirlediğim boxSize içine alır

    faceapi.draw.drawDetections(canvas, resizedDetections); //sonucları canvasa yazdıracak

    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections); //tespit ettiği çizgileri yazacak

    faceapi.draw.drawFaceExpressions(canvas, resizedDetections); //tespit ettiği duyguları yazdıracak

    // console.log(detections);
  }, 100); //setInterval sayesinde 100 milisaniyede bir görüntüye gidip duygu değişimini kontrol edecek
});