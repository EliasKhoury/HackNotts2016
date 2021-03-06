package EliasKhouryLines

import org.scalatra._
import scalate.ScalateSupport
import org.fusesource.scalate.{ TemplateEngine, Binding }
import org.fusesource.scalate.layout.DefaultLayoutStrategy
import javax.servlet.http.HttpServletRequest
import collection.mutable

import org.scalatra.atmosphere._
import org.json4s._
import org.scalatra.json.{JValueResult, JacksonJsonSupport}
import JsonDSL._
import java.util.Date
import java.text.SimpleDateFormat


import scala.concurrent._
import ExecutionContext.Implicits.global


import org.scalatra.servlet.AsyncSupport


class MyScalatraServlet extends ScalatraServlet 
    with ScalateSupport with JValueResult 
    with JacksonJsonSupport with SessionSupport 
    with AtmosphereSupport {
    implicit val jsonFormats: Formats = DefaultFormats

  get("/") {
    contentType="text/html"
    layoutTemplate("index.ssp")
  }

  atmosphere("/lines") {
    new AtmosphereClient {
      def receive: AtmoReceive = {
        case Connected =>
          println("Client %s is connected" format uuid)
          broadcast(("author" -> "Someone") ~ ("message" -> "joined the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)

        case Disconnected(ClientDisconnected, _) =>
          broadcast(("author" -> "Someone") ~ ("message" -> "has left the room") ~ ("time" -> (new Date().getTime.toString )), Everyone)

        case Disconnected(ServerDisconnected, _) =>
          println("Server disconnected the client %s" format uuid)
        case _: TextMessage =>
          send(("author" -> "system") ~ ("message" -> "Only json is allowed") ~ ("time" -> (new Date().getTime.toString )))

        case JsonMessage(json) =>
          //println("Got message %s from %s".format((json \ "message").extract[String], (json \ "author").extract[String]))
          val msg = json merge (("time" -> (new Date().getTime().toString)): JValue)
          broadcast(msg) // by default a broadcast is to everyone but self
          //  send(msg) // also send to the sender
      }
    }
  }

  error {
    case t: Throwable => t.printStackTrace()
  }

  notFound {
    // remove content type in case it was set through an action
    contentType = null
    // Try to render a ScalateTemplate if no route matched
    findTemplate(requestPath) map { path =>
      contentType = "text/html"
      layoutTemplate(path)
    } orElse serveStaticResource() getOrElse resourceNotFound()
  }

}
