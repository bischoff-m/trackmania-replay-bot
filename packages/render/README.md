# Dev Guide

<details open>
  <summary>
    <h2>Defining Steps</h2>
  </summary>

**Steps are small chucks of code that are executed in a specific order.** You
can run them one after another using the UI. To make it easier to define steps,
I used the following structure and conventions.

<!-- > A step is a function that returns a Step object: `Callable[[], Step]` -->

You define a step by using the `@stepmethod` decorator. You can provide a
**description** that is displayed in the UI. The method must **return a step
method** that represents the next step. If it returns `None`, the exceution of
the step chain exits.

```python
@stepmethod(description="This is an example step")
def example1():
    # Do something
    print("example1 running")
    return example2
```

The decorator encapsulates the function into a method that returns a step, i.e.
is of type `Callable[[], Step | None]`. You can execute the step like this:

```python
step: Step = example1()
print(step.description)         # Prints "This is an example step"
next_step: Step = step.run()    # Prints "example1 running"
```

### Groups

A step can also itself consist of several sub-steps. If you want the group to
provide a description for the UI, you can define it like this:

```python
@stepmethod(description="example1")
def example1():
    @stepmethod(description="inner1")
    def inner1():
        print("inner1 running")
        return inner2

    @stepmethod(description="inner2")
    def inner2():
        print("inner2 running")
        return None

    return inner1
```

If you don't want to provide a description and instantly execute the first step:

```python
def example1():
    @stepmethod(description="inner1")
    def inner1():
        print("inner1 running")
        return inner2

    @stepmethod(description="inner2")
    def inner2():
        print("inner2 running")
        return None

    return inner1()
```

Groups can be nested as deep as you want.

You can use this to do conditional branching. Use the `nonlocal` keyword to
write to variables in the outer scope.

```python
import random

def entry():
    state = 0

    @stepmethod()
    def step_write():
        nonlocal state
        state = random.randint(0, 1)
        return step_read

    @stepmethod()
    def step_read():
        if state == 0:
            return step_if_0
        else:
            return step_if_1

    @stepmethod()
    def step_if_0():
        print("step_if_0 running")
        return None

    @stepmethod()
    def step_if_1():
        print("step_if_1 running")
        return None

    return step_write()

```

### Example

This examples shows how to use steps and groups of steps with local state.

```python
# %%
from typing import Callable
from classes import Step

def stepmethod(
    description: str = "No description provided.",
):
    def decorator(step_func: Callable[[], Step | None]):
        def wrapper():
            def run_step():
                get_next = step_func()
                return get_next and get_next()

            return Step(
                description=description,
                run=run_step,
            )

        return wrapper

    return decorator


def entry():
    @stepmethod(description="example1")
    def example1():
        example1_next = example2
        example1_state = "State updated by local steps: "

        @stepmethod(description="inner1")
        def inner1():
            print("inner1 running")
            return inner2

        @stepmethod(description="inner2")
        def inner2():
            inner2_next = inner5

            @stepmethod(description="inner3")
            def inner3():
                nonlocal example1_state
                example1_state += "inner3"
                print("inner3 running")
                return inner4

            @stepmethod(description="inner4")
            def inner4():
                print("inner4 running")
                return inner2_next

            print("inner2 running")
            return inner3

        @stepmethod(description="inner5")
        def inner5():
            @stepmethod(description="inner6")
            def inner6():
                nonlocal example1_state
                example1_state += ", inner6"
                print("inner6 running")
                return inner7

            @stepmethod(description="inner7")
            def inner7():
                nonlocal example1_state
                example1_state += ", inner7"
                print("inner7 running")
                print(example1_state)
                return example1_next

            print("inner5 running")
            return inner6

        print("example1 running")
        return inner1

    # Anonymous group (first inner step is executed immediately)
    def example2():
        example2_next = example3

        @stepmethod(description="inner8")
        def inner8():
            print("inner8 running")
            return inner9

        @stepmethod(description="inner9")
        def inner9():
            print("inner9 running")
            return example2_next

        print("Anonymous group running")
        return inner8()

    @stepmethod(description="example3")
    def example3():
        print("example3 running")
        return None

    return example1()

# %%
queue = [entry()]
while queue:
    step = queue.pop(0)
    next_step = step.run()
    if next_step:
        queue.append(next_step)
    else:
        print("End of queue")

```

This produces the output:

```
example1 running
inner1 running
inner2 running
inner3 running
inner4 running
inner5 running
inner6 running
inner7 running
State updated by local steps: inner3, inner6, inner7
Anonymous group running
inner8 running
inner9 running
example3 running
End of queue
```

</details>
