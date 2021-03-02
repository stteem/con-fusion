import { Injectable } from '@angular/core';
import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';

import { DISHES } from '../shared/dishes';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DishService {

  constructor() { }

  getDishes(): Observable<Dish[]> {
    return of(DISHES).pipe(delay(2000));
  }

  addToComments(id, comment): Observable<Comment[] | any> {
    comment.date = new Date();
    console.log('comment ', comment)
   	return of(DISHES[id].comments.push(comment));
  }

  getDish(id: string): Observable<Dish | any> {
    return of(DISHES.filter((dish) => (dish.id === id))[0]).pipe(delay(2000));
  }

  getFeaturedDish(): Observable<Dish> {
    return of(DISHES.filter((dish) => dish.featured)[0]).pipe(delay(2000));
  }

  getDishIds(): Observable<string[] | any> {
    return of(DISHES.map(dish => dish.id ));
  }
}
