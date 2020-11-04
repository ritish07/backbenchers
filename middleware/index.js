var middlewareObj={};
var User = require('../models/user')
var Post = require('../models/post')
var Trending = require('../models/trending.js');
var Popular = require('../models/popular.js');
var Recommended = require('../models/recommended.js');
var mongoose = require('mongoose');

middlewareObj.isAdmin = function(req,res,next){
  if(req.isAuthenticated() && req.user.role === 'admin'){
    return next();
  }
  else{
    res.status(401).send('you are not authorized as you are not an admin')
  }
}

middlewareObj.isAuditor = function(req,res,next){
  if(req.isAuthenticated() && (req.user.role === 'auditor' || req.user.role === 'admin') ){
    return next();
  }
  else{
    res.status(401).send('you are not authorized as you are not an auditor')
  }
}

middlewareObj.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/register_or_login");
}


middlewareObj.partitionTrending = function(copyOfPosts, s, e){
  var pivot = copyOfPosts[s].views;
  console.log(pivot)
  var i = s+1;
  var count=0;
  while(i<=e){
    if(copyOfPosts[i].views >= pivot){
      count++;
    }
    i++;
  }

  var pivotindex = s + count;
  var  temp =  copyOfPosts[s];
  copyOfPosts[s] = copyOfPosts[pivotindex];
  copyOfPosts[pivotindex] = temp;

  i = s;
  var j = e;
  while(i<pivotindex && j>pivotindex){
    if(copyOfPosts[i].views >= copyOfPosts[pivotindex].views){
      i++;
    } else if(copyOfPosts[j].views < copyOfPosts[pivotindex].views){
      j--;
    } else{
      var  temp =  copyOfPosts[i];
      copyOfPosts[i] = copyOfPosts[j];
      copyOfPosts[j] = temp;
      i++; j--;
    }
  }
  return pivotindex;
}

middlewareObj.partitionPopular = function(copyOfPosts, s, e){
  var pivot = copyOfPosts[s].likes;
  console.log(pivot)
  var i = s+1;
  var count=0;
  while(i<=e){
    if(copyOfPosts[i].likes >= pivot){
      count++;
    }
    i++;
  }

  var pivotindex = s + count;
  var  temp =  copyOfPosts[s];
  copyOfPosts[s] = copyOfPosts[pivotindex];
  copyOfPosts[pivotindex] = temp;

  i = s;
  var j = e;
  while(i<pivotindex && j>pivotindex){
    if(copyOfPosts[i].likes >= copyOfPosts[pivotindex].likes){
      i++;
    } else if(copyOfPosts[j].likes < copyOfPosts[pivotindex].likes){
      j--;
    } else{
      var  temp =  copyOfPosts[i];
      copyOfPosts[i] = copyOfPosts[j];
      copyOfPosts[j] = temp;
      i++; j--;
    }
  }
  return pivotindex;
}



middlewareObj.quickSortRecursive = function(copyOfPosts,si,ei,type){
  if(si>=ei){
    return;
  }
  var index=0;
  if(type ==='trending'){
    index = middlewareObj.partitionTrending(copyOfPosts,si,ei);
    middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'trending');
    middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'trending');
  } else if(type ==='popular'){
    index = middlewareObj.partitionPopular(copyOfPosts,si,ei);
    middlewareObj.quickSortRecursive(copyOfPosts,si,index-1,'popular');
    middlewareObj.quickSortRecursive(copyOfPosts,index+1,ei,'popular');
  }
  // console.log(index)
  
}

middlewareObj.trending = function(){
  var be=0,comm=0,eng=0,pd=0;
  Trending.deleteMany({},(err,posts)=>{
    if(err) console.log(err)
    else{
      console.log("deleted posts are ", posts)
      
  Post.find({}, (err,posts)=>{
    if(err){
      console.log("error occured while sorting the trending articles",err);
    } else {
   
      var copyOfPosts = JSON.parse(JSON.stringify(posts));
      middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'trending');
      // console.log("copyOfPosts of all subjects is here",copyOfPosts);
      console.log("copyOfPosts.length",copyOfPosts.length);
      // var countBE=0,countC=0,countE=0,countPD=0;
      // for(var i=0;i<copyOfPosts.length;i++){
      //   if(copyOfPosts[i].subject === 'business-economics'){
      //     countBE++;
      //   } else if(copyOfPosts[i].subject === 'commerce'){
      //     countC++;
      //   } else if(copyOfPosts[i].subject === 'engineering') {
      //     countE++;
      //   } else if(copyOfPosts[i].subject === 'personality-development') {
      //     countPD++;
      //   }
      // }

      // console.log("countBE : ",countBE,"countC : ",countC,"countE : ",countE," countPD : ",countPD );

      
      console.log("copyOfPosts.length again",copyOfPosts.length);
      for(var i=0;i<copyOfPosts.length;i++){
        console.log("be  : ",be,"comm : ",comm,"eng : ",eng,"pd : ",pd)
        // Trending.countDocuments({subject: 'business-economics'},(err,c1)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of business economics after each push from the full trending list  :", c1);
        //     be = c1;
        //   }
        // })
        // Trending.countDocuments({subject: 'commerce'},(err,c2)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of commerce after each push from the full trending list  :", c2);
        //     comm = c2;
        //   }
        // })
        // Trending.countDocuments({subject: 'engineering'},(err,c3)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of business economics after each push from the full trending list  :", c3);
        //     eng = c3;
        //   }
        // })
        // Trending.countDocuments({subject: 'personality-development'},(err,c)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of personality-development after each push from the full trending list  :", c);
        //     be = c;
        //   }
        // })

        if(copyOfPosts[i].subject === 'business-economics' && be<3){
          
          console.log("views of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].views)
          var trendingpost = new Trending();
          trendingpost.subject = copyOfPosts[i].subject;
          trendingpost.rank = i+1;
          trendingpost.views = copyOfPosts[i].views;
          trendingpost.post = copyOfPosts[i];
          be++;
          console.log("be : ",be)
          trendingpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to trending", err);
            } else {
              
              console.log("this is the post saved to trending collection", post)
              Trending.count({},(err,c)=>{
                console.log("finally : ",c);
              })
            }
          })  
        }

        if(copyOfPosts[i].subject === 'commerce' && comm<3){
        console.log("views of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].views)
        var trendingpost = new Trending();
        trendingpost.subject = copyOfPosts[i].subject;
        trendingpost.rank = i+1;
        trendingpost.views = copyOfPosts[i].views;
        trendingpost.post = copyOfPosts[i];
        comm++;
        console.log("comm : ",comm)
        trendingpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to trending", err);
          } else {
            
            console.log("this is the post saved to trending collection", post)
            }
          })  
        }

        console.log("comm outside : ",comm)

          if(copyOfPosts[i].subject === 'engineering' && eng<3){
          console.log("views of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].views)
          var trendingpost = new Trending();
          trendingpost.subject = copyOfPosts[i].subject;
          trendingpost.rank = i+1;
          trendingpost.views = copyOfPosts[i].views;
          trendingpost.post = copyOfPosts[i];
          eng++;
          console.log("eng : ",eng)
          trendingpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to trending", err);
            } else {
              
              console.log("this is the post saved to trending collection", post)
            }
          })  
        }

          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            console.log("views of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].views)
            var trendingpost = new Trending();
            trendingpost.subject = copyOfPosts[i].subject;
            trendingpost.rank = i+1;
            trendingpost.views = copyOfPosts[i].views;
            trendingpost.post = copyOfPosts[i];
            pd++;
            console.log("pd : ",pd)
            trendingpost.save((err,post)=>{
              if(err){
                console.log("error occured while saving post to trending", err);
              } else {
                
                console.log("this is the post saved to trending collection", post)
              }
            })  
          }
          
        
      }

     
    }
  })

      
    }
    
  })
      // for loop end 
   
}

middlewareObj.popular = function(){

  var be=0,comm=0,eng=0,pd=0;
  Popular.deleteMany({},(err,posts)=>{
    if(err) console.log(err)
    else{
      console.log("deleted posts are ", posts)
      
  Post.find({}, (err,posts)=>{
    if(err){
      console.log("error occured while sorting the Popular articles",err);
    } else {
   
      var copyOfPosts = JSON.parse(JSON.stringify(posts));
      middlewareObj.quickSortRecursive(copyOfPosts,0,copyOfPosts.length-1,'popular');
      // console.log("copyOfPosts of all subjects is here",copyOfPosts);
      console.log("copyOfPosts.length",copyOfPosts.length);
      // var countBE=0,countC=0,countE=0,countPD=0;
      // for(var i=0;i<copyOfPosts.length;i++){
      //   if(copyOfPosts[i].subject === 'business-economics'){
      //     countBE++;
      //   } else if(copyOfPosts[i].subject === 'commerce'){
      //     countC++;
      //   } else if(copyOfPosts[i].subject === 'engineering') {
      //     countE++;
      //   } else if(copyOfPosts[i].subject === 'personality-development') {
      //     countPD++;
      //   }
      // }

      // console.log("countBE : ",countBE,"countC : ",countC,"countE : ",countE," countPD : ",countPD );

      
      console.log("copyOfPosts.length again",copyOfPosts.length);
      for(var i=0;i<copyOfPosts.length;i++){
        console.log("be  : ",be,"comm : ",comm,"eng : ",eng,"pd : ",pd)
        // Trending.countDocuments({subject: 'business-economics'},(err,c1)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of business economics after each push from the full trending list  :", c1);
        //     be = c1;
        //   }
        // })
        // Trending.countDocuments({subject: 'commerce'},(err,c2)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of commerce after each push from the full trending list  :", c2);
        //     comm = c2;
        //   }
        // })
        // Trending.countDocuments({subject: 'engineering'},(err,c3)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of business economics after each push from the full trending list  :", c3);
        //     eng = c3;
        //   }
        // })
        // Trending.countDocuments({subject: 'personality-development'},(err,c)=>{
        //   if(err) console.log(err)
        //   else{
        //     console.log("count of documents of personality-development after each push from the full trending list  :", c);
        //     be = c;
        //   }
        // })

        if(copyOfPosts[i].subject === 'business-economics' && be<3){
          
          console.log("likes of business-economics copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
          var popularpost = new Popular();
          popularpost.subject = copyOfPosts[i].subject;
          popularpost.rank = i+1;
          popularpost.likes = copyOfPosts[i].likes;
          popularpost.post = copyOfPosts[i];
          be++;
          console.log("be : ",be)
          popularpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to popular", err);
            } else {
              console.log("this is the post saved to popular collection", post)
              Popular.count({},(err,c)=>{
                console.log("finally : ",c);
              })
            }
          })  
        }

        if(copyOfPosts[i].subject === 'commerce' && comm<3){
        console.log("likes of  commerce copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
        var popularpost = new Popular();
        popularpost.subject = copyOfPosts[i].subject;
        popularpost.rank = i+1;
        popularpost.likes = copyOfPosts[i].likes;
        popularpost.post = copyOfPosts[i];
        comm++;
        console.log("comm : ",comm)
        popularpost.save((err,post)=>{
          if(err){
            console.log("error occured while saving post to popular", err);
          } else {
            
            console.log("this is the post saved to popular collection", post)
            }
          })  
        }

        console.log("comm outside : ",comm)

          if(copyOfPosts[i].subject === 'engineering' && eng<3){
          console.log("likes of  engineering copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
          var popularpost = new Popular();
          popularpost.subject = copyOfPosts[i].subject;
          popularpost.rank = i+1;
          popularpost.likes = copyOfPosts[i].likes;
          popularpost.post = copyOfPosts[i];
          eng++;
          console.log("eng : ",eng)
          popularpost.save((err,post)=>{
            if(err){
              console.log("error occured while saving post to popular", err);
            } else {
              
              console.log("this is the post saved to popular collection", post)
            }
          })  
        }

          if(copyOfPosts[i].subject === 'personality-development' && pd<3){
            console.log("likes of  personality-development copyOfPosts ",i+1," are : ",copyOfPosts[i].likes)
            var popularpost = new Popular();
            popularpost.subject = copyOfPosts[i].subject;
            popularpost.rank = i+1;
            popularpost.likes = copyOfPosts[i].likes;
            popularpost.post = copyOfPosts[i];
            pd++;
            console.log("pd : ",pd)
            popularpost.save((err,post)=>{
              if(err){
                console.log("error occured while saving post to popular", err);
              } else {
                
                console.log("this is the post saved to popular collection", post)
              }
            })  
          }
          
        
      }

     
    }
  })

      
    }
    
  })

}

middlewareObj.totalArticles = function(){
  Post.count({}, function(err, result) {
    if (err) {
      return err;
    } else {
      return result;
    }
  });
}


module.exports = middlewareObj; 