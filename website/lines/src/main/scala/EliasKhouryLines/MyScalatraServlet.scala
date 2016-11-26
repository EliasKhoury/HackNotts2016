package EliasKhouryLines

import org.scalatra._

class MyScalatraServlet extends LinesStack {

  get("/") {
    contentType="text/html"
    layoutTemplate("index.ssp")
  }

}
