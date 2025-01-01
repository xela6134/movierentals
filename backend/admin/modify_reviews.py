import random

dummy_reviews = {
    1: [
        "Horrific. My eyes hurt watching this.",
        "Disgusting movie dude.",
        "Worst film I've ever seen.",
        "Expectation vs. Reality: Complete fail.",
        "More disappointing than the sequel.",
        "This movie was a complete disaster."
        "I can't believe I watched the entire movie.",
        "This film is as useful as a screen door on a submarine.",
        "Well, that escalated quickly... to awful.",
        "It's not me, it's you... and the movie.",
        "I had to break up for recommending this to my ex."
    ],
    2: [
        "Meh. It was a solid 2 from me.",
        "Kinda sus, not sure what's happening here. 🤨",
        "Skibidi",
        "Mediocre at best.",
        "I'm crying inside... from boredom.",
        "It's a no from me, dawg.",
        "Disappointing compared to expectations.",
        "Average performances, nothing special.",
        "Not great, but not the worst.",
        "Lowkey disappointing.",
        ""
    ],
    3: [
        "It was okay, nothing extra special. 🤷‍♂️",
        "Aight, it's aight.",
        "Average movie, worth a watch if you're bored.",
        "Middle of the road, like a plain slice of bread.",
        "Just another day in movie paradise.",
        "It's a 3, because 2 was too harsh and 4 was too kind.",
        "Good in parts, but overall average.",
        "A standard movie experience.",
        "Neither here nor there.",
        "Satisfactory, like a lukewarm cup of tea."
    ],
    4: [
        "Good movie! 10/10 would watch again. 👍",
        "This movie slaps! 🎬🔥",
        "Solid direction and cinematography.",
        "Well-crafted and engaging.",
        "Solid as a rock... if the rock had good acting.",
        "A+ for effort and execution.",
        "Highkey enjoyed this one.",
        "Big brain movie with great twists.",
        "Highly recommend watching this.",
        "On point! Nailed it."
    ],
    5: [
        "Absolute masterpiece! Chef's kiss! 👌💯",
        "This movie is straight fire! 🔥🔥🔥",
        "One does not simply watch a better movie.",
        "Everything about this film is lit. 🔥",
        "A cinematic experience worthy of a standing ovation.",
        "This deserves all the Oscars! 🏆",
        "Mind blown! 🤯",
        "Outstanding in every aspect.",
        "I'm shook. Best movie ever.",
        "A must-watch for everyone.",
    ]
}

with open("old_reviews.csv", 'r') as infile, open("new_reviews.csv", 'w') as outfile:
    for num, line in enumerate(infile):
        if num == 0:
            continue
        processed = line.strip()
        rating = int(processed.split(',')[2])
        review_num = random.randint(0,9)
        review = dummy_reviews[rating][review_num]

        new_line = f'{processed},"{review}"\n'
        outfile.write(new_line)
