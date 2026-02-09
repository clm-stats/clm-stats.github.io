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
           (if (= tag (sym "&!"))
               (add-child parent (list (unpack subbody)))
               `(let [,newparent {:tag ,(tostring tag) :attrs {} :children {}}]
                  (do
                    ,(unpack (flatten (icollect [_ subf (ipairs subbody)]
                                        (map-form newparent subf)))))
                  ,(add-child parent newparent))))]
        [(add-child parent f)]))

  (local parent (gensym))
  `(fn ,name
     ,args
     (let [,parent {:attrs {} :children []}]
       (do
         ,(unpack (flatten (icollect [_ f (ipairs body)] (map-form parent f)))))
       (. ,parent :children))))

; "<svg class=\"" $1
; fill=\"currentColor\"

(_.module
 (loc SELF_CLOSING {:meta true
                    :link true
                    :area true
                    :base true
                    :br true
                    :col true
                    :hr true
                    :input true
                    :img true})
 (loc raw-icons
      {:magnifying-glass #(.. "<svg class=\"" $1
                              "\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"> <path fill=\"currentColor\" d=\"M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z\"/></svg>")
       :bars #(.. "<svg class=\"" $1
                  "\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z\"/></svg>")
       :calendar #(.. "<svg class=\"" $1
                      "\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z\"/></svg>")
       :filter #(.. "<svg class=\"" $1
                    "\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M96 128C83.1 128 71.4 135.8 66.4 147.8C61.4 159.8 64.2 173.5 73.4 182.6L256 365.3L256 480C256 488.5 259.4 496.6 265.4 502.6L329.4 566.6C338.6 575.8 352.3 578.5 364.3 573.5C376.3 568.5 384 556.9 384 544L384 365.3L566.6 182.7C575.8 173.5 578.5 159.8 573.5 147.8C568.5 135.8 556.9 128 544 128L96 128z\"/></svg>")
       :x #(.. "<svg class=\"" $1
               "\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 640\"><path fill=\"currentColor\" d=\"M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z\"/></svg>")})

 (fn mk-icon [k cn]
   ((. raw-icons k) (or cn :size-6)))

 (loc Icon {})
 (each [i (pairs raw-icons)]
   (tset Icon i [(mk-icon i)])
   (each [cn s (pairs {:size-6 :s6 :size-4 :s4})]
     (tset (. Icon i) s [(mk-icon i cn)])
     (tset (. Icon i s) :cn #(mk-icon i (.. $1 " " cn)))))

 (fn slurp [p]
   (with-open [f (io.open p :r)] (f:read "*all")))

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
                 self-closing? (. SELF_CLOSING tag)
                 a-str (attrs-str attrs)
                 c-str (html-str-impl (or children []))]
             (if tag
                 (.. "<" tag " " a-str ">"
                     (if self-closing? ""
                         (.. c-str "</" tag ">")))
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
       (script "window.periodId = {{ page.periodId }};"
               (&! slurp "./js/index.js"))
       (script [:src htmx-src] [:integrity htmx-integrity]
               [:crossorigin :anonymous])
       (script [:defer true] [:src alpine-src]))
     (body [:class "min-h-screen bg-info dark:bg-info-content"]
       (div [:class
             "container rounded-none min-h-screen mx-auto px-0 card bg-base-100 shadow-xl m-4 my-0"]
         (div [:class "flex flex-col self-stretch sticky top-0"]
           (div [:class "navbar p-2 min-h-auto bg-base-200 shadow-sm"]
             (div [:class "navbar-start gap-4"]
               (div [:class "btn btn-ghost"]
                 [:tabindex 0]
                 [:role :button]
                 (img [:class :h-8] [:src "/favicon.ico"])
                 (span [:class "hidden lg:inline"] :CLM)))
             (div [:class "navbar-end gap-4"]
               (div [:class
                     "join rounded border-gray-100 dark:border-gray-900 border-1"]
                 (div (label [:class "input validator join-item"]
                             Icon.magnifying-glass
                             (input [:type :text]
                               [:placeholder "Search Players..."])))
                 (button [:class "btn btn-soft bg-base-100 join-item"]
                   Icon.filter)
                 (button [:class "btn btn-soft bg-base-100 join-item"]
                   Icon.calendar))
               (details [:class "group dropdown dropdown-end"]
                 (summary [:class "btn btn-ghost lg:hidden"]
                   (div [:class "swap swap-rotate group-open:swap-active"]
                     (&! Icon.bars.s6.cn :swap-off)
                     (&! Icon.x.s6.cn "swap-on group-open:rotate-0")))
                 (ul [:tabindex -1]
                   [:class
                    "menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"]
                   (li (a :ITEM)))))))
         :hi
         (p [:x-show :isLoading] :loading)))))
 (spit "docs/_layouts/fnl_test.html" (html-page clm-stats)))
