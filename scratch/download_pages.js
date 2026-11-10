const https = require('https');
const fs = require('fs');

const urls = [
  "https://s3.amazonaws.com/document-export.canva.com/AlZpY/DAHahXAlZpY/1/thumbnail/0001.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHW27RK5IK%2F20261110%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261110T050852Z&X-Amz-Expires=36000&X-Amz-Signature=d2962dfc4bcda6f0600a6d44aff7dda72fa6e054e5af15525a47ce268297ec87&X-Amz-SignedHeaders=host&response-expires=Tue%2C%2010%20Nov%202026%2015%3A08%3A52%20GMT",
  "https://s3.amazonaws.com/document-export.canva.com/AlZpY/DAHahXAlZpY/1/thumbnail/0002.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHW27RK5IK%2F20261110%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261110T051706Z&X-Amz-Expires=36402&X-Amz-Signature=ae9fa32c25da6a131a611a90ea432131915a5694f2c3e02d154f0ba3f9ca4aee&X-Amz-SignedHeaders=host&response-expires=Tue%2C%2010%20Nov%202026%2015%3A23%3A48%20GMT",
  "https://s3.amazonaws.com/document-export.canva.com/AlZpY/DAHahXAlZpY/1/thumbnail/0003.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHW27RK5IK%2F20261110%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261110T031918Z&X-Amz-Expires=44726&X-Amz-Signature=9912ffc3670c39034d480da274bed39f7e86d283d6ba1d6644768b95616113fc&X-Amz-SignedHeaders=host&response-expires=Tue%2C%2010%20Nov%202026%2015%3A44%3A44%20GMT",
  "https://s3.amazonaws.com/document-export.canva.com/AlZpY/DAHahXAlZpY/1/thumbnail/0004.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUHW27RK5IK%2F20261109%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261109T192757Z&X-Amz-Expires=70310&X-Amz-Signature=6d37d12b0e80cf66d8c9bff9ebe030a44904fc191cbb5515f31abaa43a7d2845&X-Amz-SignedHeaders=host&response-expires=Tue%2C%2010%20Nov%202026%2014%3A59%3A47%20GMT"
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error('Status ' + res.statusCode));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(); });
    }).on('error', reject);
  });
}

(async () => {
  for (let i = 0; i < urls.length; i++) {
    const dest = `scratch/page_${i + 1}.png`;
    await download(urls[i], dest);
    console.log(`Downloaded ${dest} (${fs.statSync(dest).size} bytes)`);
  }
})();
