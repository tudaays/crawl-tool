const axios = require('axios')
const cheerio = require('cheerio')

const fetchUrl = 'https://babyanimalspics.com/:postId';

exports.handler = async (event, context, callback) => {
  const currentUrl = `https://${event.headers.host}${event.path}`
  const postId = event.path.replace(/\/\.netlify\/functions\/[^/]*\//, '');
  const originalUrl = fetchUrl.replace(':postId', postId);
  console.log(event)
  const isRedirect = event?.headers?.referer?.includes('facebook.com');

  if (isRedirect) {
    return {
      statusCode: 302,
      headers: {
        "Location": originalUrl,
      },
    };
  } else {
    try {
      const response = await axios.get(originalUrl);
      const $ = cheerio.load(response.data);
      const title = $('head > title').text();
      const content = $('.entry-content').html();
      const ogTags = $('meta').toArray().filter((e) => e?.attribs?.property?.startsWith('og:')).map((e) => $.html(e)).join('').replace(originalUrl, currentUrl);
      return {
        statusCode: 200,
        body: htmlTemplate.replace(':content', `<h3>${title}</h3>` + content).replace(':title', title).replace(':ogtags', ogTags),
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    } catch (err) {
      console.log(err);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: template404,
      }
    }
  }
};

const htmlTemplate = `<html lang="en"><head> <style>img{width: 100%; height: auto;}ul{list-style-type: none; margin: 0; padding: 0; overflow: hidden; background-color: #333;}li{float: left;}li a{display: block; color: white; text-align: center; padding: 14px 16px; text-decoration: none;}li a:hover:not(.active){background-color: #111;}.active{background-color: #4CAF50;}</style> <title>:title</title> :ogtags</head><body style="background:#eee;"><div style="padding:20px;margin:30px auto;padding:20px;max-width:800px;background:white;box-shadow: 5px 5px 5px #888888;"> <div> <ul> <li><a href="#home">Home</a></li><li><a href="#news">News</a></li><li><a href="#contact">Contact</a></li><li style="float:right"><a class="active" href="#about">About</a></li></ul> </div><div style="margin-top: 1rem"> :content </div></div></body></html>`;
const template404 = `<html><head><title>404 Not Found</title><style>*{margin:0;padding:0;box-sizing:border-box}body{overflow:hidden;background-color:#f4f6ff}.container{width:100vw;height:100vh;display:flex;justify-content:center;align-items:center;font-family:Poppins,sans-serif;position:relative;left:6vmin;text-align:center}.cog-wheel1,.cog-wheel2{transform:scale(.7)}.cog1,.cog2{width:40vmin;height:40vmin;border-radius:50%;border:6vmin solid #f3c623;position:relative}.cog2{border:6vmin solid #4f8a8b}.down,.left,.left-down,.left-top,.right,.right-down,.right-top,.top{width:10vmin;height:10vmin;background-color:#f3c623;position:absolute}.cog2 .down,.cog2 .left,.cog2 .left-down,.cog2 .left-top,.cog2 .right,.cog2 .right-down,.cog2 .right-top,.cog2 .top{background-color:#4f8a8b}.top{top:-14vmin;left:9vmin}.down{bottom:-14vmin;left:9vmin}.left{left:-14vmin;top:9vmin}.right{right:-14vmin;top:9vmin}.left-top{transform:rotateZ(-45deg);left:-8vmin;top:-8vmin}.left-down{transform:rotateZ(45deg);left:-8vmin;top:25vmin}.right-top{transform:rotateZ(45deg);right:-8vmin;top:-8vmin}.right-down{transform:rotateZ(-45deg);right:-8vmin;top:25vmin}.cog2{position:relative;left:-10.2vmin;bottom:10vmin}h1{color:#142833}.first-four{position:relative;left:6vmin;font-size:40vmin}.second-four{position:relative;right:18vmin;z-index:-1;font-size:40vmin}.wrong-para{font-family:Montserrat,sans-serif;position:absolute;bottom:15vmin;padding:3vmin 12vmin 3vmin 3vmin;font-weight:600;color:#092532}</style><script>let t1=gsap.timeline(); let t2=gsap.timeline(); let t3=gsap.timeline(); t1.to(".cog1",{transformOrigin: "50% 50%", rotation: "+=360", repeat: -1, ease: Linear.easeNone, duration: 8}); t2.to(".cog2",{transformOrigin: "50% 50%", rotation: "-=360", repeat: -1, ease: Linear.easeNone, duration: 8}); t3.fromTo(".wrong-para",{opacity: 0},{opacity: 1, duration: 1, stagger:{repeat: -1, yoyo: true}});</script></head><body><div class="container"><h1 class="first-four">4</h1><div class="cog-wheel1"><div class="cog1"><div class="top"></div><div class="down"></div><div class="left-top"></div><div class="left-down"></div><div class="right-top"></div><div class="right-down"></div><div class="left"></div><div class="right"></div></div></div><div class="cog-wheel2"><div class="cog2"><div class="top"></div><div class="down"></div><div class="left-top"></div><div class="left-down"></div><div class="right-top"></div><div class="right-down"></div><div class="left"></div><div class="right"></div></div></div><h1 class="second-four">4</h1><p class="wrong-para">Uh Oh! Page not found!</p></div></body></html>`
