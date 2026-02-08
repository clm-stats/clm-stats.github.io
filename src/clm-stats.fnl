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
    (if (sequence? f) [(add-attr parent f)] (list? f)
        [(let [[tag & subbody] f
               newparent (gensym)]
           `(let [,newparent {:tag ,(tostring tag) :attrs {} :children {}}]
              (do
                ,(unpack (flatten (icollect [_ subf (ipairs subbody)]
                                    (map-form newparent subf)))))
              ,(add-child parent newparent)))] [(add-child parent f)]))

  (local parent (gensym))
  `(fn ,name
     ,args
     (let [,parent {:attrs {} :children []}]
       (do
         ,(unpack (flatten (icollect [_ f (ipairs body)] (map-form parent f)))))
       (. ,parent :children))))

(_.module
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
 (defhtml clm-stats
   []
   (html [:lang :en]
         (head (meta [:charset :utf-8])
               (meta [:name :viewport]
                     [:content "width=device-width, initial-scale=1"])
               (script [:src htmx-src] [:integrity htmx-integrity]
                       [:crossorigin :anonymous])
               (script [:defer true] [:src alpine-src]))
         (body (h1 [:x-data "{message:'I <3 Alpine'}"] [:x-text :message]))))
 (print (html-str clm-stats)))
