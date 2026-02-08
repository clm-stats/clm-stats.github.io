(import-macros _ :__)

(local alpine-src "https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js")

(local htmx-src "https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js")

(->> "sha384-/TgkGk7p307TH7EXJDuUlgG3Ce1UVolAOFopFekQkkXihi5u/6OCvVKyz1W+idaz"
     (local htmx-integrity))

(comment :asdfljkhasdklfhjaklsdjhfaksdjlfhaklsdhfaksjldfhaklsjhdfkalsdhf)

(fn conj [l v]
  (tset l #l v)
  l)

(macro defhtml [name args & body]
  (fn flatten [l2d]
    (accumulate [res [] _ l1d (ipairs l2d)]
      (icollect [_ v (ipairs l1d) &into res]
        v)))

  (fn add-child [parent c]
    `(tset (. ,parent :children) (+ 1 (length (. ,parent :children))) ,c))

  (fn add-attr [parent [a v]]
    `(tset (. ,parent :attrs) ,a ,v))

  (fn map-form [parent f]
    (if (sequence? f)
        [(add-attr parent f)]
        (list? f)
        [(let [[tag & subbody] f
               newparent (gensym)]
           `(let [,newparent {:tag ,(tostring tag) :attrs {} :children {}}]
              (do
                ,(unpack (flatten (icollect [_ subf (ipairs subbody)]
                                    (map-form newparent subf)))))
              ,(add-child parent newparent)))]
        [(add-child parent f)]))

  (local parent (gensym))
  `(fn ,name
     ,args
     (let [,parent {:attrs {} :children []}]
       (do
         ,(unpack (flatten (icollect [_ f (ipairs body)] (map-form parent f)))))
       (. ,parent :children))))

(_.module
 (loc icons
      {:bars "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z\"/></svg>"})
 (fn spit [p s]
   (with-open [f (io.open p :w)]
     (f:write s)))

 (fn html-str [...]
   (fn attrs-str [attrs]
     (accumulate [str "" a v (pairs (or attrs {}))]
       (if (= v true) (.. str a " ")
           (.. str a "=\"" (string.gsub v "\"" "\\\"") "\" "))))

   (fn html-str-impl [els]
     (fn el-str [el]
       (if (_.fn? el)
           (html-str-impl [(el)])
           (_.table? el)
           (let [{: tag : attrs : children} el
                 a-str (attrs-str attrs)
                 c-str (html-str-impl (or children []))]
             (if tag
                 (.. "<" tag " " a-str ">" c-str "</" tag ">")
                 (html-str-impl el)))
           (tostring el)))

     (accumulate [str " " __ el (ipairs els)] (.. str (el-str el) " ")))

   (let [els [...]] (html-str-impl els)))

 (fn html-page [...]
   (.. "<!DOCTYPE html>\n" (html-str ...)))

 (defhtml clm-stats
   []
   (html [:lang :en]
     (head (meta [:charset :utf-8])
       (meta [:name :viewport] [:content "width=device-width, initial-scale=1"])
       (title "{{ page.title }}")
       (link [:rel :stylesheet] [:href "/index.css"])
       (script [:src htmx-src] [:integrity htmx-integrity]
               [:crossorigin :anonymous])
       (script [:defer true] [:src alpine-src]))
     (body [:class "min-h-screen bg-base-300"]
       (div [:class
             "container rounded-none min-h-screen mx-auto px-0 card bg-base-100 shadow-xl m-4 my-0"]
         (div [:class "flex flex-col self-stretch sticky top-0"]
           (div [:class "navbar bg-base-200 shadow-sm"]
             (div [:class "navbar-start gap-4"]
               (div [:class "btn btn-ghost"]
                 [:tabindex 0]
                 [:role :button]
                 (img [:class :h-8] [:src "/favicon.ico"])
                 (span [:class "hidden lg:inline"] :CLM)))
             (div [:class :navbar-end]
               (span [:class "size-6"] icons.bars))))
         :hello))))
 (spit "docs/_layouts/fnl_test.html" (html-page clm-stats)))
