module.exports = {
  development: {
    imgCDN: '/images',
    jsCDN: '/javascripts',
    cssCDN: '/stylesheets',
    customCDN: {
      bootstrapCDNjs: '/javascripts/lib/bootstrap',
      bootstrapCDNcss: '/stylesheets/lib/bootstrap/css',
      fontawesomeCDNcss: '/stylesheets/lib/font-awesome/css',
      select2CDNcss: '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/css', //
      select2CDNjs: '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/js', //
      jqueryCDNjs: '/javascripts/lib/jquery',
    }
  },
  production: {
    imgCDN: '//res.cloudinary.com/csquire/raw/upload/images',
    jsCDN: '//res.cloudinary.com/csquire/raw/upload/javascripts',
    cssCDN: '//res.cloudinary.com/csquire/raw/upload/stylesheets',
    customCDN: {
      bootstrapCDNjs: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js',
      bootstrapCDNcss: '//res.cloudinary.com/csquire/raw/upload/stylesheets/lib/bootstrap/css',
      fontawesomeCDNcss: '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css',
      select2CDNcss: '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/css',
      select2CDNjs: '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/js',
      jqueryCDNjs: '//code.jquery.com',
    }
  },
  qa: {
    imgCDN: '//res.cloudinary.com/csquireqa/raw/upload/images',
    jsCDN: '//res.cloudinary.com/csquireqa/raw/upload/javascripts',
    cssCDN: '//res.cloudinary.com/csquireqa/raw/upload/stylesheets',
    customCDN: {
      bootstrapCDNjs: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js',
      bootstrapCDNcss: '//res.cloudinary.com/csquireqa/raw/upload/stylesheets/lib/bootstrap/css',
      fontawesomeCDNcss: '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css',
      select2CDNcss: '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/css',
      select2CDNjs: '//cdnjs.cloudflare.com/ajax/libs/select2/4.0.1/js',
      jqueryCDNjs: '//code.jquery.com',
    }
  }
};